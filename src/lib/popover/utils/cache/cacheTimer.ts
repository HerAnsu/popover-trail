/**
 * Safe timer manager for background cache maintenance and polling.
 *
 * @module cache/cacheTimer
 */

import { DISPOSE_SYMBOL } from '../disposable';
import { noop } from '../functional';

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

/**
 * Lifecycle-safe timer orchestrator for cache pruning intervals and key-specific polling routines.
 *
 * @remarks
 * Implements Resource Acquisition Is Initialization (RAII) and supports `[Symbol.dispose]`
 * for deterministic teardown. Automatically calls `.unref()` on Node.js runtimes to prevent
 * active timers from blocking process exit.
 *
 * @example
 * ```typescript
 * const timers = new CacheTimerManager(50);
 * timers.startPruneTimer(60000, () => cache.prune());
 * const unpoll = timers.registerPolling('key-1', 10000, () => refresh('key-1'));
 * ```
 */
export class CacheTimerManager {
  /** Maximum number of concurrent key polling timers allowed. */
  public readonly capacity: number;
  private pruneTimer: ReturnType<typeof setInterval> | null = null;
  private readonly pollTimers = new Map<string, ReturnType<typeof setInterval>>();

  /**
   * Constructs a new `CacheTimerManager`.
   *
   * @param capacity - Maximum capacity of concurrent polling timers (default: 100).
   */
  constructor(capacity = 100) {
    this.capacity = capacity;
  }

  /**
   * Starts a background pruning interval if not already active.
   *
   * @param intervalMs - Duration in milliseconds between prune runs.
   * @param task - Maintenance callback to invoke on each tick.
   *
   * @example
   * ```typescript
   * timers.startPruneTimer(30000, () => cache.evictExpired());
   * ```
   */
  public startPruneTimer(intervalMs: number, task: () => void): void {
    if (this.pruneTimer || intervalMs <= 0 || typeof setInterval === 'undefined') return;
    this.pruneTimer = setInterval(task, intervalMs);
    safeUnref(this.pruneTimer);
  }

  /**
   * Registers a recurring polling timer for a specific cache key.
   *
   * @param key - Cache key identifying this polling stream.
   * @param intervalMs - Polling interval in milliseconds.
   * @param task - Execution callback for each poll tick.
   * @returns Cleanup function that stops polling for this key.
   *
   * @example
   * ```typescript
   * const stop = timers.registerPolling('user-profile', 5000, () => fetchProfile());
   * // Later:
   * stop();
   * ```
   */
  public registerPolling(key: string, intervalMs: number, task: () => void): () => void {
    this.stopPolling(key);
    if (
      intervalMs <= 0 ||
      typeof setInterval === 'undefined' ||
      this.pollTimers.size >= this.capacity
    ) {
      return noop;
    }

    const timer = setInterval(task, intervalMs);
    safeUnref(timer);
    this.pollTimers.set(key, timer);
    return () => this.stopPolling(key);
  }

  /**
   * Cancels and removes the active polling timer for the specified key.
   *
   * @param key - Cache key to stop polling for.
   */
  public stopPolling(key: string): void {
    const timer = this.pollTimers.get(key);
    if (timer) {
      clearInterval(timer);
      this.pollTimers.delete(key);
    }
  }

  /**
   * Disposes all active prune and polling intervals idempotently.
   */
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
