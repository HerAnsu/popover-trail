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

export function tryResetItem<T>(reset: ((item: T) => void) | undefined, item: T): void {
  if (!reset) return;
  try {
    reset(item);
  } catch {
    // Fault isolation per Rule 14: swallow external reset exceptions
  }
}

export function tryEvictItem<T>(onEvict: ((item: T) => void) | undefined, item: T): void {
  if (!onEvict) return;
  try {
    onEvict(item);
  } catch {
    // Fault isolation per Rule 14: swallow external onEvict exceptions
  }
}

export function executeAcquire<T>(
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

export function executeRelease<T>(
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

