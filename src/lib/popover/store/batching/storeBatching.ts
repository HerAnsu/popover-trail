/**
 * High-Performance Store Batching & Microtask Coalescing Engine.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * Implements atomic multi-action batch transactions:
 * δ_batch(S, B) = δ*(S, B)
 *
 * Guarantees that multiple state mutations executed within a transactional
 * boundary produce a single aggregated state change notification and revision increment.
 *
 * @module store/batching/storeBatching
 */

import type { StoreApi } from 'zustand/vanilla';
import { DISPOSE_SYMBOL } from '../../utils/disposable';
import type { BatchingManager, BatchStateGetter } from './storeBatchingTypes';
import { BatchingCoordinator, attachStoreSubscriber } from './storeBatchingSubscriber';

export type {
  BatchedStoreApi,
  BatchingManager,
  BatchListener,
  BatchStateGetter,
  BatchFlushFn,
  BatchCallback,
  BatchingOptions,
} from './storeBatchingTypes';
export { batchUpdatesScope } from './storeBatchingScheduler';

/**
 * Creates an isolated BatchingManager instance to control transaction boundaries,
 * coalesce high-frequency microtasks, and suppress duplicate notifications.
 *
 * @param autoBatchMicrotasks - Whether updates outside explicit batches are coalesced via microtasks.
 * @returns An initialized BatchingManager instance implementing ScopeDisposable.
 */
export function createBatchingManager(autoBatchMicrotasks = true): BatchingManager {
  const coord = new BatchingCoordinator(autoBatchMicrotasks);

  /**
   * Begins an explicit batch transaction. Increments nesting depth.
   */
  const startBatch = (): void => {
    coord.batchDepth++;
  };

  /**
   * Closes an explicit batch transaction. Flushes if nesting depth reaches 0.
   */
  const endBatch = (getState?: BatchStateGetter): void => {
    if (coord.batchDepth > 0) coord.batchDepth--;
    if (coord.batchDepth === 0) coord.flush(getState);
  };

  /**
   * Forces an immediate synchronous flush of any pending batched dispatches.
   */
  const flushSync = (getState?: BatchStateGetter): void => {
    coord.flush(getState);
  };

  /**
   * Terminates coordinator state, cleaning up master subscription and listeners.
   */
  const dispose = (): void => {
    coord.dispose();
  };

  return {
    startBatch,
    endBatch,
    flushSync,
    flush: flushSync,
    attachSubscriber: <TState>(store: StoreApi<TState>) =>
      attachStoreSubscriber(store, coord as BatchingCoordinator<TState>),
    dispose,
    [DISPOSE_SYMBOL]: dispose,
    [Symbol.dispose]: dispose,
  };
}
