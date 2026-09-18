/**
 * Type contracts and interfaces for Store Batching subsystem.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * Implements formal batching algebra:
 * δ_batch(S, [a1, ..., an]) = δ*(S, [a1, ..., an])
 *
 * @module store/batching/storeBatchingTypes
 */

import type { StoreApi } from 'zustand/vanilla';
import type { ScopeDisposable, DISPOSE_SYMBOL } from '../../utils/disposable';

/**
 * Listener invoked when a coalesced batch transaction completes.
 * Receives the final committed state and the pre-transaction baseline state.
 *
 * @template TState - Shape of the store state snapshot.
 * @param state - Newly committed state snapshot.
 * @param prevState - Baseline state snapshot before the batch began.
 *
 * @example
 * ```typescript
 * const listener: BatchListener<MyState> = (state, prevState) => {
 *   console.log('Batch completed. Modified count:', state.activeCount - prevState.activeCount);
 * };
 * ```
 */
export type BatchListener<TState = unknown> = (state: TState, prevState: TState) => void;

/**
 * Synchronous or scheduled batch state retrieval accessor function.
 *
 * @template TState - Shape of the store state snapshot.
 * @returns Current state snapshot.
 *
 * @example
 * ```typescript
 * const getState: BatchStateGetter<MyState> = () => store.getState();
 * ```
 */
export type BatchStateGetter<TState = unknown> = () => TState;

/**
 * Flush callback signature executed when committing queued batch updates.
 *
 * @template TState - Shape of the store state snapshot.
 * @param getState - Optional state retrieval function overriding the default getter.
 *
 * @example
 * ```typescript
 * const onFlush: BatchFlushFn<MyState> = (getState) => {
 *   const state = getState ? getState() : fallbackState;
 *   console.log('Flushed at state:', state);
 * };
 * ```
 */
export type BatchFlushFn<TState = unknown> = (getState?: BatchStateGetter<TState>) => void;

/**
 * Scoped batch execution callback receiving state transitions.
 *
 * @template R - Return value type from the batch execution block.
 *
 * @example
 * ```typescript
 * const batchFn: BatchCallback<number> = () => {
 *   store.setState({ count: 1 });
 *   return 42;
 * };
 * ```
 */
export type BatchCallback<R> = () => R;

/**
 * Zustand StoreApi extension supporting batched subscriptions and selector tunnelling.
 *
 * @template TState - Shape of the store state.
 *
 * @example
 * ```typescript
 * const store = vanillaStore as BatchedStoreApi<MyState>;
 * const unsubscribe = store.subscribe((state, prev) => {
 *   console.log('Batched notification:', state);
 * });
 * ```
 */
export interface BatchedStoreApi<TState> extends StoreApi<TState> {
  subscribe: {
    (listener: (state: TState, prevState: TState) => void): () => void;
    <T>(
      listener: (selectedState: T) => void,
      selector: (state: TState) => T,
      equalityFn?: (a: T, b: T) => boolean,
    ): () => void;
  };
}

/**
 * Configuration options for the store batching coordinator.
 */
export interface BatchingOptions {
  /**
   * Whether to coalesce multiple synchronous notifications into a single microtask.
   * @default true
   */
  readonly autoBatchMicrotasks?: boolean;
}

/**
 * Batching Manager interface orchestrating transactional state updates and coalesced subscriptions.
 *
 * @example
 * ```typescript
 * const manager: BatchingManager = createBatchingManager();
 * manager.startBatch();
 * store.setState({ open: true });
 * store.setState({ pinned: true });
 * manager.endBatch(); // Dispatches single notification
 * ```
 */
export interface BatchingManager extends ScopeDisposable {
  /** Increments the batch nesting depth counter. */
  startBatch: () => void;
  /** Decrements the batch nesting depth counter and flushes when depth reaches zero. */
  endBatch: BatchFlushFn;
  /** Synchronously flushes any pending dirty batch updates immediately. */
  flushSync: BatchFlushFn;
  /** Attaches the batching coordinator wrapper to a vanilla Zustand store instance. */
  attachSubscriber: <TState = unknown>(store: StoreApi<TState>) => void;
  /** Disposes the coordinator, cleans up master subscriptions and clears listener sets. */
  dispose: () => void;
  /** Symbol-based disposable contract for RAII resource disposal. */
  [DISPOSE_SYMBOL]?: () => void;
  /** Standard explicit resource management disposal symbol. */
  [Symbol.dispose]?: () => void;
}
