/**
 * Coordinates batched state updates and subscriber notifications for the popover store.
 * Groups multiple synchronous mutations into a single subscriber notification cycle
 * or coalesces them via microtasks to prevent unnecessary re-renders.
 *
 * @module store/batching/BatchingCoordinator
 */

import type { BatchListener, BatchStateGetter } from './storeBatchingTypes';
import { notifyBatchSubscribers } from './storeBatchingScheduler';

/**
 * Manages batch transactions and listener notification cycles for store state updates.
 *
 * When multiple popovers open, close, or reposition simultaneously (such as during cascading
 * teardowns or multi-card drags), triggering subscribers on every micro-mutation causes UI churn.
 * `BatchingCoordinator` tracks batch nesting depth, suppresses intermediate dispatches,
 * and notifies all listeners once the outermost batch completes.
 *
 * @template TState - Shape of the store state being coordinated.
 *
 * @example
 * ```typescript
 * const coordinator = new BatchingCoordinator(true);
 *
 * // Start batch transaction
 * coordinator.batchDepth++;
 * coordinator.isBatchDirty = true;
 *
 * // End batch transaction and notify subscribers
 * coordinator.batchDepth--;
 * coordinator.flush(() => store.getState());
 * ```
 */
export class BatchingCoordinator<TState = unknown> {
  /** Indicates whether the state was modified during an active batch. */
  public isBatchDirty = false;

  /** Current batch nesting depth. Flushes occur only when depth reaches zero. */
  public batchDepth = 0;

  /** Guards against scheduling multiple concurrent microtasks. */
  public isMicrotaskQueued = false;

  /** Terminal disposal flag preventing post-lifecycle notifications. */
  public isDisposed = false;

  /** Baseline snapshot captured at the start of a batch transaction. */
  public initialBatchState: TState | undefined = undefined;

  /** Active getter reference bound to the underlying Zustand store. */
  public activeGetState: BatchStateGetter<TState> | undefined = undefined;

  /** Raw unsubscribe function from the underlying Zustand store subscription. */
  public masterUnsubscribe: (() => void) | null = null;

  /** Set of active registered batched subscriber callbacks. */
  public readonly batchListeners = new Set<BatchListener<TState>>();

  /** Whether updates outside explicit batches are automatically coalesced via microtasks. */
  public readonly autoBatchMicrotasks: boolean;

  /**
   * Initializes a new BatchingCoordinator.
   *
   * @param autoBatchMicrotasks - When true, unbatched synchronous store changes are queued
   * and coalesced into a single microtask notification. Defaults to true.
   */
  constructor(autoBatchMicrotasks = true) {
    this.autoBatchMicrotasks = autoBatchMicrotasks;
  }

  /**
   * Flushes pending state changes to all registered batch subscribers.
   *
   * If an explicit batch is still in progress (`batchDepth > 0`) or if the coordinator is disposed,
   * this call is a no-op. When flushed, subscribers receive both the new state and the pre-batch state.
   *
   * @param getState - Optional state retrieval function overriding the active store getter.
   *
   * @example
   * ```typescript
   * coordinator.flush(() => store.getState());
   * ```
   */
  public flush(getState?: BatchStateGetter<TState>): void {
    this.isMicrotaskQueued = false;
    if (this.isDisposed || this.batchDepth > 0) return;

    const getter = getState ?? this.activeGetState;
    if (this.isBatchDirty && getter) {
      this.isBatchDirty = false;
      const currentState = getter();
      notifyBatchSubscribers(
        this.batchListeners,
        currentState,
        this.initialBatchState ?? currentState,
      );
    }
    this.initialBatchState = undefined;
  }

  /**
   * Disposes the coordinator, unsubscribing from the underlying store and clearing all listeners.
   * Once disposed, subsequent flush calls are ignored.
   *
   * @example
   * ```typescript
   * coordinator.dispose();
   * ```
   */
  public dispose(): void {
    this.isDisposed = true;
    this.isMicrotaskQueued = false;
    this.isBatchDirty = false;
    this.initialBatchState = undefined;
    this.batchListeners.clear();
    this.masterUnsubscribe?.();
    this.masterUnsubscribe = null;
  }
}
