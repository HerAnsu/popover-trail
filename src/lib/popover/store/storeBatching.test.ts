import { describe, it, expect, vi } from 'vitest';
import { createBatchingManager, batchUpdatesScope } from './storeBatching';
import type { StoreApi } from 'zustand/vanilla';

describe('storeBatching module (Microtask Coalescing & Batching)', () => {
  const createMockStore = <TState extends Record<string, unknown>>(
    initialState: TState,
  ): StoreApi<TState> => {
    let state = { ...initialState };
    const rawListeners = new Set<(state: TState, prevState: TState) => void>();

    const store: StoreApi<TState> = {
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
      subscribe: (listener: (state: TState, prevState: TState) => void) => {
        rawListeners.add(listener);
        return () => {
          rawListeners.delete(listener);
        };
      },
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
});
