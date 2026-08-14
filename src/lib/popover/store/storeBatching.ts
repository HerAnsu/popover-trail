/**
 * Store Batching Manager for popover-trail.
 * Manages atomic batching updates and subscriber notification suppression.
 *
 * @module storeBatching
 */

import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore } from '../types';

/**
 * Manager interface coordinating atomic batch updates and subscriber notification suppression.
 */
export interface BatchingManager {
  /** Increments batching depth and begins notification suppression. */
  startBatch: () => void;
  /** Decrements batching depth and flushes dirty notifications if top-level batch finished. */
  endBatch: (getState?: () => unknown) => void;
  /** Attaches batching awareness to a Zustand store's subscriber mechanism. */
  attachSubscriber: <TData, TContext, TPopoverKey extends string>(
    store: StoreApi<PopoverStore<TData, TContext, TPopoverKey>>,
  ) => void;
}

/**
 * Executes a callback within an atomic batch update scope, suppressing subscriber notifications
 * until the entire batch finishes, then emitting a single consolidated update.
 *
 * @template R - Return value type of the batched function.
 * @param manager - Batching manager instance.
 * @param fn - Synchronous callback executing multiple store updates.
 * @param getState - Optional getter function to retrieve latest state snapshot.
 * @returns The exact value returned by `fn()`.
 */
export function batchUpdatesScope<R>(
  manager: BatchingManager,
  fn: () => R,
  getState?: () => unknown,
): R {
  manager.startBatch();
  try {
    return fn();
  } finally {
    manager.endBatch(getState);
  }
}

/**
 * Instantiates a batching manager instance coordinating batching depth
 * and subscriber notification suppression during batch updates.
 */
type BatchListener = (state: unknown, prevState: unknown) => void;

function notifyBatchSubscribers(
  listeners: Set<BatchListener>,
  getState?: () => unknown,
  initialBatchState?: unknown,
): void {
  if (!getState) return;
  const currentState = getState();
  const prevStateToUse = initialBatchState ?? currentState;
  for (const listener of listeners) {
    try {
      listener(currentState, prevStateToUse);
    } catch (err) {
      console.error('[popover-trail]: Exception in subscriber:', err);
    }
  }
}

export function createBatchingManager(): BatchingManager {
  let batchDepth = 0;
  let isBatchDirty = false;
  let initialBatchState: unknown = undefined;
  const batchListeners = new Set<BatchListener>();

  return {
    startBatch: () => {
      if (batchDepth === 0) {
        isBatchDirty = false;
      }
      batchDepth++;
    },
    endBatch: (getState?: () => unknown) => {
      if (batchDepth > 0) {
        batchDepth--;
      }
      if (batchDepth === 0) {
        if (isBatchDirty) {
          isBatchDirty = false;
          notifyBatchSubscribers(batchListeners, getState, initialBatchState);
        }
        initialBatchState = undefined;
      }
    },
    attachSubscriber: <TData, TContext, TPopoverKey extends string>(
      store: StoreApi<PopoverStore<TData, TContext, TPopoverKey>>,
    ) => {
      // Typed alias scoped to this call's generics — no `as` casts needed
      type TypedListener = (
        state: PopoverStore<TData, TContext, TPopoverKey>,
        prevState: PopoverStore<TData, TContext, TPopoverKey>,
      ) => void;

      const rawSubscribe = store.subscribe.bind(store);

      store.subscribe = ((listener: unknown, selector?: unknown, equalityFn?: unknown) => {
        if (typeof selector === 'function') {
          return (rawSubscribe as Function)(listener, selector, equalityFn);
        }
        const typedListener = listener as TypedListener;
        const handler: BatchListener = (s, p) => {
          if (s !== undefined && p !== undefined) {
            typedListener(
              s as PopoverStore<TData, TContext, TPopoverKey>,
              p as PopoverStore<TData, TContext, TPopoverKey>,
            );
          }
        };
        batchListeners.add(handler);
        const unsubRaw = rawSubscribe((state, prevState) => {
          if (batchDepth > 0) {
            if (initialBatchState === undefined) {
              initialBatchState = prevState;
            }
            isBatchDirty = true;
            return;
          }
          try {
            typedListener(state, prevState);
          } catch (err) {
            console.error('[popover-trail]: Exception in subscriber:', err);
          }
        });
        return () => {
          batchListeners.delete(handler);
          unsubRaw();
        };
      }) as typeof store.subscribe;
    },
  };
}
