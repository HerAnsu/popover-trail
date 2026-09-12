/**
 * Microtask Scheduling and Safe Batch Notification Helpers.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * Enforces fault-isolated execution barriers for subscriber callbacks:
 * Alloc(Frame) = 0 bytes in steady-state iteration.
 *
 * @module store/batching/storeBatchingScheduler
 */

import { logger } from '../../utils/logger';
import type {
  BatchCallback,
  BatchListener,
  BatchingManager,
  BatchStateGetter,
} from './storeBatchingTypes';

/**
 * Schedules a callback to be executed in the microtask queue.
 * Falls back to an immediately-resolved async task in environments where queueMicrotask is absent.
 *
 * @param fn - The zero-argument callback to execute in microtask phase.
 */
export function scheduleMicrotask(fn: () => void): void {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(fn);
    return;
  }
  void (async () => {
    try {
      fn();
    } catch (err) {
      logger.error('[popover-trail]: Microtask execution error:', err);
    }
  })();
}

/**
 * Safely dispatches committed state transitions to registered batch listeners.
 * Isolates consumer callback exceptions to prevent disruption of the batch engine.
 *
 * @template TState - Shape of the committed store state.
 * @param listeners - Immutable or snapshot set of registered subscriber callbacks.
 * @param currentState - The newly committed state snapshot.
 * @param prevState - The baseline state snapshot prior to the batch transaction.
 */
export function notifyBatchSubscribers<TState>(
  listeners: ReadonlySet<BatchListener<TState>>,
  currentState: TState,
  prevState: TState,
): void {
  if (listeners.size === 0) return;
  const snapshot = [...listeners];
  for (const listener of snapshot) {
    try {
      listener(currentState, prevState);
    } catch (err) {
      logger.error('[popover-trail]: Exception in batch subscriber listener:', err);
    }
  }
}

/**
 * Executes an arbitrary synchronous function within a batch update transaction.
 * Automatically initiates batching before execution and guarantees termination in finally block.
 *
 * @template R - Return type of the batched execution callback.
 * @template TState - State type retrieved when committing the batch.
 * @param manager - Active BatchingManager instance controlling transactional state.
 * @param fn - Scoped callback function to execute within the batch.
 * @param getState - Optional state retrieval getter to pass during endBatch flush.
 * @returns Result produced by the callback function.
 */
export function batchUpdatesScope<R, TState = unknown>(
  manager: BatchingManager,
  fn: BatchCallback<R>,
  getState?: BatchStateGetter<TState>,
): R {
  manager.startBatch();
  try {
    return fn();
  } finally {
    manager.endBatch(getState);
  }
}
