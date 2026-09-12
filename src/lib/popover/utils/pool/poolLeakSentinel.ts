/**
 * Development Leak Sentinel and Stack Trace Tracker for Object Pools.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolLeakSentinel
 */

import type { LeakedItemInfo } from './poolTypes';

export class PoolLeakSentinel<T> {
  private readonly activeItems = new Map<T, LeakedItemInfo>();
  private readonly enabled: boolean;
  private readonly defaultTimeoutMs: number;

  constructor(enabled = false, defaultTimeoutMs = 10000) {
    this.enabled = enabled;
    this.defaultTimeoutMs = defaultTimeoutMs;
  }

  onAcquire(item: T): void {
    if (!this.enabled) return;
    const stack = new Error().stack;
    this.activeItems.set(item, {
      acquiredAt: Date.now(),
      stack,
    });
  }

  onRelease(item: T): void {
    if (!this.enabled) return;
    this.activeItems.delete(item);
  }

  getLeakedItems(timeoutMs = this.defaultTimeoutMs, now = Date.now()): Map<T, LeakedItemInfo> {
    const leaks = new Map<T, LeakedItemInfo>();
    if (!this.enabled) return leaks;

    for (const [item, info] of this.activeItems.entries()) {
      if (now - info.acquiredAt >= timeoutMs) {
        leaks.set(item, info);
      }
    }
    return leaks;
  }

  get inFlightCount(): number {
    return this.activeItems.size;
  }

  clear(): void {
    this.activeItems.clear();
  }
}
