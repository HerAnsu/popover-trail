import { describe, it, expect, vi } from 'vitest';
import { createBatchingManager, batchUpdatesScope, type BatchedStoreApi } from './storeBatching';
import type { StoreApi } from 'zustand/vanilla';

describe('storeBatching module (Microtask Coalescing & Batching)', () => {
  const createMockStore = <TState extends Record<string, unknown>>(
    initialState: TState,
  ): BatchedStoreApi<TState> => {
    let state = { ...initialState };
    const rawListeners = new Set<(state: TState, prevState: TState) => void>();

    const store: BatchedStoreApi<TState> = {
      getState: () => state,
      getInitialState: () => state,
      setState: (updater) => {
        const prevState = state;
        state =
          typeof updater === 'function'
            ? (updater as (s: TState) => TState)(state)
            : { ...state, ...updater };
        for (const listener of rawListeners) {
          listener(state, prevState);
        }
      },
      subscribe: ((
        listener: (state: TState, prevState: TState) => void,
        selector?: (state: TState) => unknown,
        equalityFn?: (a: unknown, b: unknown) => boolean,
      ) => {
        if (!selector) {
          rawListeners.add(listener);
          return () => {
            rawListeners.delete(listener);
          };
        }
        // Mirrors zustand/subscribeWithSelector: immediate, per-selection notifications.
        let prevSelected = selector(state);
        const selectorListener = () => {
          const nextSelected = selector(state);
          const isEqual = equalityFn
            ? equalityFn(prevSelected, nextSelected)
            : Object.is(prevSelected, nextSelected);
          if (!isEqual) {
            prevSelected = nextSelected;
            listener(nextSelected as TState, prevSelected as TState);
          }
        };
        rawListeners.add(selectorListener);
        return () => {
          rawListeners.delete(selectorListener);
        };
      }) as StoreApi<TState>['subscribe'],
    };

    return store;
  };

  it('suppresses notifications during explicit startBatch and flushes exactly once on endBatch', () => {
    const manager = createBatchingManager(false);
    const store = createMockStore({ count: 0 });
    manager.attachSubscriber(store);

    const listener = vi.fn();
    store.subscribe(listener);

    manager.startBatch();
    store.setState({ count: 1 });
    store.setState({ count: 2 });
    store.setState({ count: 3 });

    expect(listener).not.toHaveBeenCalled();

    manager.endBatch(store.getState);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ count: 3 }),
      expect.objectContaining({ count: 0 }),
    );
  });

  it('automatically coalesces multiple sequential state mutations into 1 microtask notification', async () => {
    const manager = createBatchingManager(true);
    const store = createMockStore({ step: 'init' });
    manager.attachSubscriber(store);

    const listener = vi.fn();
    store.subscribe(listener);

    // Multiple unbatched synchronous mutations in the same EventLoop turn
    store.setState({ step: 'step-1' });
    store.setState({ step: 'step-2' });
    store.setState({ step: 'step-3' });

    // Synchronously before microtask execution, listener has not yet been spammed
    expect(listener).not.toHaveBeenCalled();

    // Await the microtask queue turn
    await Promise.resolve();

    // Exactly 1 notification received with the final coalesced state
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ step: 'step-3' }),
      expect.objectContaining({ step: 'init' }),
    );
  });

  it('immediately flushes queued notifications via flushSync without waiting for microtask', () => {
    const manager = createBatchingManager(true);
    const store = createMockStore({ val: 10 });
    manager.attachSubscriber(store);

    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ val: 20 });
    store.setState({ val: 30 });

    expect(listener).not.toHaveBeenCalled();

    // Force immediate synchronous flush
    manager.flushSync(store.getState);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ val: 30 }),
      expect.objectContaining({ val: 10 }),
    );
  });

  it('runs callback cleanly within batchUpdatesScope and handles nested batches', () => {
    const manager = createBatchingManager(false);
    const store = createMockStore({ a: 1, b: 2 });
    manager.attachSubscriber(store);

    const listener = vi.fn();
    store.subscribe(listener);

    const result = batchUpdatesScope(
      manager,
      () => {
        store.setState({ a: 10 });

        batchUpdatesScope(
          manager,
          () => {
            store.setState({ b: 20 });
          },
          store.getState,
        );

        return 'done';
      },
      store.getState,
    );

    expect(result).toBe('done');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ a: 10, b: 20 }),
      expect.objectContaining({ a: 1, b: 2 }),
    );
  });

  it('guarantees endBatch cleanup even if callback throws an error in batchUpdatesScope', () => {
    const manager = createBatchingManager(false);
    const endBatchSpy = vi.spyOn(manager, 'endBatch');

    expect(() =>
      batchUpdatesScope(manager, () => {
        throw new Error('Scope explosion');
      }),
    ).toThrow('Scope explosion');

    expect(endBatchSpy).toHaveBeenCalled();
  });

  it('safely isolates exceptions thrown by individual subscribers', async () => {
    const manager = createBatchingManager(true);
    const store = createMockStore({ x: 0 });
    manager.attachSubscriber(store);

    const failingListener = vi.fn(() => {
      throw new Error('Subscriber crash');
    });
    const healthyListener = vi.fn();

    store.subscribe(failingListener);
    store.subscribe(healthyListener);

    store.setState({ x: 100 });

    await Promise.resolve();

    expect(failingListener).toHaveBeenCalled();
    expect(healthyListener).toHaveBeenCalledWith(
      expect.objectContaining({ x: 100 }),
      expect.objectContaining({ x: 0 }),
    );
  });

  it('cancels pending microtasks and cleans up on dispose()', async () => {
    const manager = createBatchingManager(true);
    const store = createMockStore({ active: false });
    manager.attachSubscriber(store);

    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ active: true });

    // Dispose manager before microtask resolves
    manager.dispose();

    await Promise.resolve();

    expect(listener).not.toHaveBeenCalled();
  });

  it('BatchedStoreApi contract: selector subscriptions bypass batching and honor equalityFn', async () => {
    const manager = createBatchingManager(true);
    const store = createMockStore({ count: 0, label: 'a' });
    manager.attachSubscriber(store);

    const seen: number[] = [];
    let equalityCalls = 0;
    const batchedStore = store;
    const unsubscribe = batchedStore.subscribe(
      (selected: number) => {
        seen.push(selected);
      },
      (state: { count: number; label: string }) => state.count,
      () => {
        // Count invocations to prove the selector overload tunnels through
        // untouched instead of joining the batch channel.
        equalityCalls++;
        return false;
      },
    );

    // Two synchronous mutations coalesce plain listeners into one notification,
    // but the selector listener observes each intermediate value immediately.
    store.setState({ count: 1 });
    store.setState({ count: 2 });

    expect(seen).toEqual([1, 2]);
    await Promise.resolve();
    expect(seen).toEqual([1, 2]);
    expect(equalityCalls).toBeGreaterThan(0);

    unsubscribe();
    store.setState({ count: 3 });
    expect(seen).toEqual([1, 2]);
  });
});
