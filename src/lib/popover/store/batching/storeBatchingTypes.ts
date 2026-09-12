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
 */
export type BatchListener<TState = unknown> = (state: TState, prevState: TState) => void;

/**
 * Synchronous or scheduled batch state retrieval accessor function.
 */
export type BatchStateGetter<TState = unknown> = () => TState;

/**
 * Flush callback signature executed when committing queued batch updates.
 */
export type BatchFlushFn<TState = unknown> = (getState?: BatchStateGetter<TState>) => void;

/**
 * Scoped batch execution callback receiving state transitions.
 */
export type BatchCallback<R> = () => R;

/**
 * Zustand StoreApi extension supporting batched subscriptions and selector tunnelling.
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
 */
export interface BatchingManager extends ScopeDisposable {
  /** Increments the batch nesting depth counter. */
  startBatch: () => void;
  /** Decrements the batch nesting depth counter and flushes when depth reaches zero. */
  endBatch: (getState?: () => unknown) => void;
  /** Synchronously flushes any pending dirty batch updates immediately. */
  flushSync: (getState?: () => unknown) => void;
  /** Optional flush alias matching flushSync. */
  flush?: (getState?: () => unknown) => void;
  /** Attaches the batching coordinator wrapper to a vanilla Zustand store instance. */
  attachSubscriber: <TState = unknown>(store: StoreApi<TState>) => void;
  /** Disposes the coordinator, cleans up master subscriptions and clears listener sets. */
  dispose: () => void;
  /** Symbol-based disposable contract for RAII resource disposal. */
  [DISPOSE_SYMBOL]?: () => void;
  /** Standard explicit resource management disposal symbol. */
  [Symbol.dispose]?: () => void;
}

