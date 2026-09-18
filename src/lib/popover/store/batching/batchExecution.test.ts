import { describe, it, expect, vi } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { createBatchingManager, batchUpdatesScope } from './storeBatching';

interface CounterState {
  readonly count: number;
  readonly revision: number;
  readonly message: string;
}

describe('batchExecution module', () => {
  it('coalesces multiple state mutations within a batch into a single listener dispatch', () => {
    const store = createStore<CounterState>(() => ({
      count: 0,
      revision: 0,
      message: 'init',
    }));

    const manager = createBatchingManager(false);
    manager.attachSubscriber(store);

    const listener = vi.fn();
    store.subscribe(listener);

    manager.startBatch();
    store.setState({ count: 1, revision: 1 });
    store.setState({ count: 2, revision: 2 });
    store.setState({ count: 3, revision: 3, message: 'done' });

    expect(listener).not.toHaveBeenCalled();

    manager.endBatch(store.getState);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      { count: 3, revision: 3, message: 'done' },
      { count: 0, revision: 0, message: 'init' },
    );

    manager.dispose();
  });

  it('supports nested batch scopes and delays commit until outermost boundary exits', () => {
    const store = createStore<CounterState>(() => ({ count: 0, revision: 0, message: '' }));
    const manager = createBatchingManager(false);
    manager.attachSubscriber(store);

    const listener = vi.fn();
    store.subscribe(listener);

    manager.startBatch(); // Level 1
    store.setState({ count: 10 });

    manager.startBatch(); // Level 2
    store.setState({ count: 20 });
    manager.endBatch(store.getState);

    expect(listener).not.toHaveBeenCalled();

    manager.endBatch(store.getState); // Outermost exit
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ count: 20 }),
      expect.objectContaining({ count: 0 }),
    );

    manager.dispose();
  });

  it('executes callbacks and returns results via batchUpdatesScope helper', () => {
    const store = createStore<CounterState>(() => ({ count: 0, revision: 0, message: '' }));
    const manager = createBatchingManager(false);
    manager.attachSubscriber(store);

    const listener = vi.fn();
    store.subscribe(listener);

    const result = batchUpdatesScope(
      manager,
      () => {
        store.setState({ count: 100 });
        store.setState({ count: 200, message: 'batched' });
        return 'COMPLETED_SUCCESSFULLY';
      },
      store.getState,
    );

    expect(result).toBe('COMPLETED_SUCCESSFULLY');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ count: 200, message: 'batched' }),
      expect.objectContaining({ count: 0 }),
    );

    manager.dispose();
  });

  it('supports manual synchronous flushing with flushSync', () => {
    const store = createStore<CounterState>(() => ({ count: 0, revision: 0, message: '' }));
    const manager = createBatchingManager(false);
    manager.attachSubscriber(store);

    const listener = vi.fn();
    store.subscribe(listener);

    manager.startBatch();
    store.setState({ count: 42 });
    manager.flushSync(store.getState);

    // flushSync while batch is open does not flush until batch depth is 0
    expect(listener).not.toHaveBeenCalled();

    manager.endBatch(store.getState);
    expect(listener).toHaveBeenCalledTimes(1);

    manager.dispose();
  });
});
