/**
 * Microtask scheduling and batch listener notification helpers.
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
 * Schedules a callback to execute in the microtask queue.
 * Falls back to an immediately-resolved async task in environments where `queueMicrotask` is absent.
 *
 * @param fn - Callback to execute in the microtask queue.
 *
 * @example
 * ```typescript
 * scheduleMicrotask(() => {
 *   coordinator.flush();
 * });
 * ```
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
 * Dispatches committed state transitions to registered batch listeners.
 * Wraps each listener call in a try/catch block so an exception in one consumer
 * callback does not prevent other listeners from receiving the update.
 *
 * @template TState - Shape of the store state.
 * @param listeners - Set of registered subscriber callbacks.
 * @param currentState - The newly committed state snapshot.
 * @param prevState - The state snapshot prior to the batch transaction.
 *
 * @example
 * ```typescript
 * notifyBatchSubscribers(coordinator.batchListeners, currentState, prevState);
 * ```
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
 * Executes a function within an explicit batch transaction.
 * Automatically starts the batch before executing `fn` and guarantees `endBatch`
 * is called in a `finally` block, ensuring notifications flush even if `fn` throws.
 *
 * @template R - Return type of the batched execution callback.
 * @template TState - State type retrieved when committing the batch.
 * @param manager - Active BatchingManager instance controlling transactional state.
 * @param fn - Function to execute within the batch.
 * @param getState - Optional state retrieval getter to pass during endBatch flush.
 * @returns Result returned by `fn`.
 *
 * @example
 * ```typescript
 * const result = batchUpdatesScope(batchManager, () => {
 *   store.setState({ x: 10 });
 *   store.setState({ y: 20 });
 *   return true;
 * });
 * // Listeners are notified once with the combined update
 * ```
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
