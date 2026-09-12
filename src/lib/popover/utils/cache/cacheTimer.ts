/**
 * Safe timer manager for background cache maintenance and polling.
 *
 * @module cache/cacheTimer
 */

import { DISPOSE_SYMBOL } from '../disposable';

function hasUnrefMethod(timer: unknown): timer is { unref: () => void } {
  return (
    typeof timer === 'object' &&
    timer !== null &&
    'unref' in timer &&
    typeof timer.unref === 'function'
  );
}

function safeUnref(timer: ReturnType<typeof setInterval>): void {
  if (hasUnrefMethod(timer)) {
    timer.unref();
  }
}

export class CacheTimerManager {
  public readonly capacity: number;
  private pruneTimer: ReturnType<typeof setInterval> | null = null;
  private readonly pollTimers = new Map<string, ReturnType<typeof setInterval>>();

  constructor(capacity = 100) {
    this.capacity = capacity;
  }

  public startPruneTimer(intervalMs: number, task: () => void): void {
    if (this.pruneTimer || intervalMs <= 0 || typeof setInterval === 'undefined') return;
    this.pruneTimer = setInterval(task, intervalMs);
    safeUnref(this.pruneTimer);
  }

  public registerPolling(key: string, intervalMs: number, task: () => void): () => void {
    this.stopPolling(key);
    if (
      intervalMs <= 0 ||
      typeof setInterval === 'undefined' ||
      this.pollTimers.size >= this.capacity
    ) {
      return () => {};
    }

    const timer = setInterval(task, intervalMs);
    safeUnref(timer);
    this.pollTimers.set(key, timer);
    return () => this.stopPolling(key);
  }

  public stopPolling(key: string): void {
    const timer = this.pollTimers.get(key);
    if (timer) {
      clearInterval(timer);
      this.pollTimers.delete(key);
    }
  }

  public destroy(): void {
    if (this.pruneTimer) {
      clearInterval(this.pruneTimer);
      this.pruneTimer = null;
    }
    for (const timer of this.pollTimers.values()) {
      clearInterval(timer);
    }
    this.pollTimers.clear();
  }

  public [DISPOSE_SYMBOL](): void {
    this.destroy();
  }
}
