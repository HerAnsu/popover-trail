/**
 * Store Batching Manager for popover-trail.
 * Manages atomic batching updates and subscriber notification suppression.
 *
 * @module storeBatching
 */

import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore } from '../types';

export interface BatchingManager {
  startBatch: () => void;
  endBatch: (getState?: () => unknown) => void;
  attachSubscriber: <TData, TContext, TPopoverKey extends string>(
    store: StoreApi<PopoverStore<TData, TContext, TPopoverKey>>,
  ) => void;
}

/**
 * Executes a callback within an atomic batch update scope, returning its exact return value `R`.
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
 * Instantiates a batching manager instance that coordinates batching state
 * and subscriber notification suppression during batchUpdates execution.
 */
type BatchListener = (state: unknown, prevState: unknown) => void;

export function createBatchingManager(): BatchingManager {
  let isBatching = false;
  let isBatchDirty = false;
  const batchListeners = new Set<BatchListener>();

  const startBatch = () => {
    isBatching = true;
    isBatchDirty = false;
  };

  return {
    startBatch,
    endBatch: (getState?: () => unknown) => {
      isBatching = false;
      if (isBatchDirty) {
        isBatchDirty = false;
        if (getState) {
          const currentState = getState();
          for (const listener of batchListeners) {
            try {
              listener(currentState, currentState);
            } catch (err) {
              console.error('[popover-trail]: Exception in subscriber:', err);
            }
          }
        }
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
          if (isBatching) {
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
