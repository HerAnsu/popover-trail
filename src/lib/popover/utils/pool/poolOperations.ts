/**
 * Zero-GC Acquisition, Release, and Fault-Isolated Execution Operations.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolOperations
 */

import type { PoolStorage } from './poolStorage';
import type { PoolMetricsTracker } from './poolMetrics';
import type { PoolLeakSentinel } from './poolLeakSentinel';
import type { PoolObserverHub } from './poolObserver';

/**
 * Safely executes an item reset callback inside an isolated try-catch barrier.
 *
 * @remarks
 * In accordance with Rule 14 (Fault Isolation), exceptions thrown by user callbacks
 * are caught and suppressed to prevent pool corruption.
 *
 * @template T - Type of pooled resource.
 * @param reset - Optional callback to reset item state.
 * @param item - Resource instance to reset.
 *
 * @example
 * ```typescript
 * tryResetItem((box) => { box.width = 0; }, box);
 * ```
 */
export function tryResetItem<T>(reset: ((item: T) => void) | undefined, item: T): void {
  if (!reset) return;
  try {
    reset(item);
  } catch {
    // Fault isolation per Rule 14: swallow external reset exceptions
  }
}

/**
 * Safely executes an item eviction callback inside an isolated try-catch barrier.
 *
 * @remarks
 * In accordance with Rule 14 (Fault Isolation), exceptions thrown by user callbacks
 * are caught and suppressed to prevent pool corruption.
 *
 * @template T - Type of pooled resource.
 * @param onEvict - Optional callback invoked when an item is evicted due to capacity overflow.
 * @param item - Resource instance being evicted.
 *
 * @example
 * ```typescript
 * tryEvictItem((item) => item.destroy(), item);
 * ```
 */
export function tryEvictItem<T>(onEvict: ((item: T) => void) | undefined, item: T): void {
  if (!onEvict) return;
  try {
    onEvict(item);
  } catch {
    // Fault isolation per Rule 14: swallow external onEvict exceptions
  }
}

/**
 * Borrows an available resource from storage, or instantiates a new one via factory if empty.
 *
 * @template T - Type of pooled resource.
 * @param storage - Underlying pool storage buffer.
 * @param factory - Instantiation factory when storage is empty.
 * @param tracker - Metrics tracker recording hits and misses.
 * @param sentinel - Leak detection sentinel recording active allocations.
 * @param observers - Optional observer hub broadcasting pool events.
 * @returns An acquired instance of `T`.
 *
 * @example
 * ```typescript
 * const item = acquirePooled(storage, factory, tracker, sentinel);
 * ```
 */
export function acquirePooled<T>(
  storage: PoolStorage<T>,
  factory: () => T,
  tracker: PoolMetricsTracker,
  sentinel: PoolLeakSentinel<T>,
  observers?: PoolObserverHub<T>,
): T {
  const item = storage.pop();
  const hit = item !== undefined;
  const res = hit ? item : factory();
  tracker.recordAcquire(hit);
  sentinel.onAcquire(res);
  observers?.notifyAcquire(res, hit);
  return res;
}

/**
 * Returns a borrowed resource to the pool storage buffer.
 *
 * @remarks
 * If the item is invalid, already in storage, or the pool has exceeded capacity,
 * the item is evicted and `false` is returned.
 *
 * @template T - Type of pooled resource.
 * @param storage - Underlying pool storage buffer.
 * @param item - Resource instance to return.
 * @param reset - Optional callback to reset item state.
 * @param onEvict - Optional callback when item cannot fit in storage.
 * @param tracker - Metrics tracker recording returns.
 * @param sentinel - Leak detection sentinel untracking returned instance.
 * @param observers - Optional observer hub broadcasting pool events.
 * @returns `true` if accepted back into storage; `false` if rejected or evicted.
 *
 * @example
 * ```typescript
 * const accepted = releasePooled(storage, item, reset, onEvict, tracker, sentinel);
 * ```
 */
export function releasePooled<T>(
  storage: PoolStorage<T>,
  item: T | null | undefined,
  reset: ((item: T) => void) | undefined,
  onEvict: ((item: T) => void) | undefined,
  tracker: PoolMetricsTracker,
  sentinel: PoolLeakSentinel<T>,
  observers?: PoolObserverHub<T>,
): boolean {
  if (item === null || item === undefined || storage.has(item)) {
    return false;
  }
  sentinel.onRelease(item);
  tryResetItem(reset, item);
  tracker.recordRelease();
  observers?.notifyRelease(item);

  if (storage.isFull) {
    tryEvictItem(onEvict, item);
    observers?.notifyEvict(item);
    return false;
  }

  storage.push(item);
  return true;
}
