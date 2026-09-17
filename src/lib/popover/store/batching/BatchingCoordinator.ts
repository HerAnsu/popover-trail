/**
 * Batching Coordination Lifecycle Engine for Store Subscriptions.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @remarks
 * **Contributor Architectural Guide**:
 * - **Transactional Atomicity Invariant**: Compound batch transactions $\mathcal{B} = [a_1, \dots, a_m]$
 *   must behave as a single atomic transition:
 *   $$\delta_{\text{batch}}(\mathcal{S}, \mathcal{B}) = \delta^*(\mathcal{S}, \mathcal{B})$$
 *   External subscribers are notified exactly once with `(currentState, initialBatchState)`, suppressing intermediate render spikes.
 * - **Re-entrancy & Nesting Depth**: `batchDepth` tracks nested batch calls (`batch(() => { batch(...) })`).
 *   Subscribers are only notified when the outermost batch concludes (`batchDepth === 0`).
 * - **Microtask Coalescing**: When updates occur outside an explicit `batch()` wrapper, if `autoBatchMicrotasks`
 *   is true, the coordinator defers notification to microtask timing (`queueMicrotask`), coalescing synchronous mutations.
 * - **Rollback Protection**: `initialBatchState` preserves the pre-transaction baseline snapshot.
 *   If an invariant fails during execution, the rollback controller restores this exact snapshot.
 *
 * @module store/batching/BatchingCoordinator
 */

import type { BatchListener, BatchStateGetter } from './storeBatchingTypes';
import { notifyBatchSubscribers } from './storeBatchingScheduler';

/**
 * Coordinates batched state dispatches, prevents listener re-entrancy,
 * and coalesces high-frequency synchronous updates into discrete flush cycles.
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

  constructor(autoBatchMicrotasks = true) {
    this.autoBatchMicrotasks = autoBatchMicrotasks;
  }

  /**
   * Flushes pending state changes to all registered batch subscribers.
   *
   * @param getState - Optional state retrieval function overriding active store getter.
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
   * Disposes the coordinator, terminating subscriptions and purging listener sets.
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
