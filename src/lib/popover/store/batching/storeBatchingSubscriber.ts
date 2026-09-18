/**
 * Store Subscriber Attachment and Selector Tunnelling Adapter.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * Provides a drop-in replacement for standard Zustand store subscriptions,
 * seamlessly tunnelling selector-based subscriptions while coalescing
 * full-store change listeners into discrete batch events.
 *
 * @module store/batching/storeBatchingSubscriber
 */

import type { StoreApi } from 'zustand/vanilla';
import type { BatchedStoreApi, BatchListener } from './storeBatchingTypes';
import { scheduleMicrotask, notifyBatchSubscribers } from './storeBatchingScheduler';
import { BatchingCoordinator } from './BatchingCoordinator';

export { BatchingCoordinator };

/**
 * Delegate signature for zustand/subscribeWithSelector store subscriptions.
 */
type SelectorSubscribeDelegate<TState> = (
  listener: unknown,
  selector?: (state: TState) => unknown,
  equalityFn?: (a: unknown, b: unknown) => boolean,
) => () => void;

/**
 * Wraps a Zustand store's subscribe method with batched change notifications.
 *
 * Intercepts master store state updates, defers non-immediate dispatches
 * when autoBatchMicrotasks is enabled or when an explicit batch is open,
 * and passes through selector-based subscriptions directly to the underlying engine.
 *
 * @example
 * ```ts
 * const coordinator = new BatchingCoordinator(true);
 * attachStoreSubscriber(vanillaStore, coordinator);
 * ```
 *
 * @template TState - Store state shape.
 * @param store - Vanilla Zustand store API to wrap.
 * @param coord - Batching coordinator tracking batch depth and active subscribers.
 */
export function attachStoreSubscriber<TState = unknown>(
  store: StoreApi<TState>,
  coord: BatchingCoordinator<TState>,
): void {
  coord.activeGetState = store.getState.bind(store);
  const rawSubscribe = store.subscribe.bind(store);

  coord.masterUnsubscribe = rawSubscribe((state, prevState) => {
    if (coord.isDisposed) return;
    if (coord.initialBatchState === undefined) coord.initialBatchState = prevState;
    coord.isBatchDirty = true;
    if (coord.batchDepth > 0) return;

    if (coord.autoBatchMicrotasks) {
      if (!coord.isMicrotaskQueued) {
        coord.isMicrotaskQueued = true;
        scheduleMicrotask(() => coord.flush(store.getState));
      }
      return;
    }

    notifyBatchSubscribers(coord.batchListeners, state, coord.initialBatchState ?? prevState);
    coord.initialBatchState = undefined;
    coord.isBatchDirty = false;
  });

  const wrappedSubscribe: BatchedStoreApi<TState>['subscribe'] = ((
    listener: BatchListener<TState>,
    selector?: (state: TState) => unknown,
    equalityFn?: (a: unknown, b: unknown) => boolean,
  ) => {
    if (typeof selector === 'function') {
      const subscribeWithSelector = rawSubscribe as SelectorSubscribeDelegate<TState>;
      return subscribeWithSelector(listener, selector, equalityFn);
    }
    coord.batchListeners.add(listener);
    return () => {
      coord.batchListeners.delete(listener);
    };
  }) as BatchedStoreApi<TState>['subscribe'];

  store.subscribe = wrappedSubscribe;
}
