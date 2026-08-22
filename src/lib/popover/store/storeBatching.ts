/**
 * High-Performance Store Batching & Microtask Coalescing Engine for popover-trail.
 * Automatically coalesces multiple synchronous state mutations into a single subscriber notification
 * via queueMicrotask using the Single Master Dispatcher pattern.
 *
 * @module storeBatching
 */

import type { StoreApi } from 'zustand/vanilla';
import { wrapResult, isErr } from '../utils/result';
import { DISPOSE_SYMBOL } from '../utils/disposable';

export type BatchListener<TState = unknown> = (state: TState, prevState: TState) => void;

export interface BatchingManager {
  startBatch: () => void;
  endBatch: (getState?: () => unknown) => void;
  flushSync: (getState?: () => unknown) => void;
  attachSubscriber: <TState = unknown>(store: StoreApi<TState>) => void;
  dispose: () => void;
  [DISPOSE_SYMBOL]?: () => void;
}

function scheduleMicrotask(callback: () => void): void {
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(callback);
  } else if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(() => {
      callback();
    });
  } else {
    void (async () => {
      await Promise.resolve();
      callback();
    })().catch((err: unknown) => {
      console.error('[popover-trail]: Microtask execution error:', err);
    });
  }
}

function notifyBatchSubscribers(
  listeners: Set<BatchListener>,
  currentState: unknown,
  previousState: unknown,
): void {
  for (const listener of listeners) {
    const notifyResult = wrapResult(() => listener(currentState, previousState));
    if (isErr(notifyResult)) {
      console.error('[popover-trail]: Exception in batch subscriber listener:', notifyResult.error);
    }
  }
}

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
 * Creates a state batching manager instance.
 *
 * @param autoBatchMicrotasks - If true, automatically batches synchronous updates within a single microtask turn.
 */
export function createBatchingManager(autoBatchMicrotasks = true): BatchingManager {
  let isBatchDirty = false;
  let batchDepth = 0;
  let isMicrotaskQueued = false;
  let isDisposed = false;
  let initialBatchState: unknown = undefined;
  let activeGetState: (() => unknown) | undefined = undefined;
  let masterUnsubscribe: (() => void) | null = null;

  const batchListeners = new Set<BatchListener>();

  const flush = (getState?: () => unknown) => {
    isMicrotaskQueued = false;
    if (isDisposed || batchDepth > 0) return;

    const getter = getState ?? activeGetState;
    if (isBatchDirty && getter) {
      isBatchDirty = false;
      const currentState = getter();
      const prevStateToUse = initialBatchState ?? currentState;
      initialBatchState = undefined;
      notifyBatchSubscribers(batchListeners, currentState, prevStateToUse);
    } else {
      initialBatchState = undefined;
    }
  };

  const manager: BatchingManager = {
    startBatch: () => {
      batchDepth++;
    },

    endBatch: (getState?: () => unknown) => {
      if (batchDepth > 0) {
        batchDepth--;
      }
      if (batchDepth === 0) {
        flush(getState);
      }
    },

    flushSync: (getState?: () => unknown) => {
      flush(getState);
    },

    attachSubscriber: <TState = unknown>(store: StoreApi<TState>) => {
      activeGetState = store.getState.bind(store);

      const rawSubscribe = store.subscribe.bind(store);

      masterUnsubscribe = rawSubscribe((state, prevState) => {
        if (isDisposed) return;

        if (initialBatchState === undefined) {
          initialBatchState = prevState;
        }
        isBatchDirty = true;

        if (batchDepth > 0) {
          return;
        }

        if (autoBatchMicrotasks) {
          if (!isMicrotaskQueued) {
            isMicrotaskQueued = true;
            scheduleMicrotask(() => {
              flush(store.getState);
            });
          }
          return;
        }

        const currentState = state;
        const previousState = initialBatchState ?? prevState;
        initialBatchState = undefined;
        isBatchDirty = false;
        notifyBatchSubscribers(batchListeners, currentState, previousState);
      });

      type TypedListener = (state: TState, prevState: TState) => void;
      interface ZustandSubscribeWithSelector<S> {
        (listener: (state: S, prevState: S) => void): () => void;
        <T>(
          listener: (selectedState: T) => void,
          selector: (state: S) => T,
          equalityFn?: (a: T, b: T) => boolean,
        ): () => void;
      }

      store.subscribe = ((listener: unknown, selector?: unknown, equalityFn?: unknown) => {
        if (typeof selector === 'function') {
          const subscribeWithSelector = rawSubscribe as ZustandSubscribeWithSelector<TState>;
          return subscribeWithSelector(
            listener as (selectedState: unknown) => void,
            selector as (state: TState) => unknown,
            equalityFn as ((a: unknown, b: unknown) => boolean) | undefined,
          );
        }

        const typedListener = listener as TypedListener;
        const handler: BatchListener = (s, p) => {
          typedListener(s as TState, p as TState);
        };

        batchListeners.add(handler);

        return () => {
          batchListeners.delete(handler);
        };
      }) as typeof store.subscribe;
    },

    dispose: () => {
      isDisposed = true;
      isMicrotaskQueued = false;
      isBatchDirty = false;
      initialBatchState = undefined;
      batchListeners.clear();
      if (masterUnsubscribe) {
        masterUnsubscribe();
        masterUnsubscribe = null;
      }
    },

    [DISPOSE_SYMBOL]: () => {
      manager.dispose();
    },
  };

  return manager;
}
