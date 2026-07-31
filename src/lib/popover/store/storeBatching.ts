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
 * Instantiates a batching manager instance that coordinates batching state
 * and subscriber notification suppression during batchUpdates execution.
 */
export function createBatchingManager(): BatchingManager {
  let isBatching = false;
  let isBatchDirty = false;
  const batchListeners = new Set<(state: unknown, prevState: unknown) => void>();

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
      const rawSubscribe = store.subscribe;

      store.subscribe = ((listener: (state: unknown, prevState: unknown) => void) => {
        batchListeners.add(listener);
        return () => {
          batchListeners.delete(listener);
        };
      }) as never;

      rawSubscribe((state, prevState) => {
        if (isBatching) {
          isBatchDirty = true;
          return;
        }
        for (const listener of batchListeners) {
          try {
            listener(state, prevState);
          } catch (err) {
            console.error('[popover-trail]: Exception in subscriber:', err);
          }
        }
      });
    },
  };
}
