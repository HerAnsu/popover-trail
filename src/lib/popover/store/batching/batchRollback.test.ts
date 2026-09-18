import { describe, it, expect, vi } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { createBatchingManager, batchUpdatesScope } from './storeBatching';
import { TransactionScope } from '../transactions/TransactionScope';
import { createMockStoreState } from '../../testing/createMockStoreState';
import type { PopoverStateData, StatePatch } from '../../types';

describe('batchRollback module', () => {
  it('restores pre-transaction state snapshot on invariant validation failure', async () => {
    const initialState = createMockStoreState<string, unknown, string>({
      ownerId: 'initial-owner',
      trail: [{ key: 'pop-1', isLoading: false, error: null, data: 'clean' }],
      zIndexOrder: ['pop-1'],
    });

    const store = createStore<PopoverStateData<string, unknown, string>>(() => initialState);
    const scope = new TransactionScope(
      () => store.getState(),
      (patch: StatePatch<string, unknown, string>) => {
        store.setState(patch);
      },
    );

    const executeFailedTransaction = scope.execute(() => {
      store.setState({ ownerId: 'corrupted-owner', trail: [] });
      // Invariant assertion failure: trail must not be empty
      if (store.getState().trail.length === 0) {
        throw new Error('INVARIANT_VIOLATION: Trail invariant breached');
      }
    });

    await expect(executeFailedTransaction).rejects.toThrow('INVARIANT_VIOLATION');

    const restoredState = store.getState();
    expect(restoredState.ownerId).toBe('initial-owner');
    expect(restoredState.trail).toHaveLength(1);
    expect(restoredState.trail[0]?.key).toBe('pop-1');
  });

  it('guarantees batch depth decrements and isolates rollback during batchUpdatesScope', () => {
    const store = createStore<{ count: number; valid: boolean }>(() => ({
      count: 10,
      valid: true,
    }));

    const manager = createBatchingManager(false);
    manager.attachSubscriber(store);
    const listener = vi.fn();
    store.subscribe(listener);

    const snapshot = { ...store.getState() };

    expect(() =>
      batchUpdatesScope(manager, () => {
        store.setState({ count: 99, valid: false });
        // Invariant check failure triggers manual rollback
        if (!store.getState().valid) {
          store.setState(snapshot);
          throw new Error('VALIDATION_FAILED');
        }
      }),
    ).toThrow('VALIDATION_FAILED');

    // State reverted to snapshot
    expect(store.getState().count).toBe(10);
    expect(store.getState().valid).toBe(true);

    // New normal batch operates without corrupted batch depth
    batchUpdatesScope(manager, () => {
      store.setState({ count: 20 });
    });

    expect(store.getState().count).toBe(20);
    expect(listener).toHaveBeenCalledTimes(2);

    manager.dispose();
  });

  it('handles nested transaction rollback without polluting outer valid state', async () => {
    const rootState = createMockStoreState<string, unknown, string>({
      ownerId: 'outer-clean',
      trail: [{ key: 'node-root', isLoading: false, error: null }],
    });

    const store = createStore<PopoverStateData<string, unknown, string>>(() => rootState);
    const applyPatch = (patch: StatePatch<string, unknown, string>) => {
      store.setState(patch);
    };

    const outerScope = new TransactionScope(() => store.getState(), applyPatch);

    await outerScope.execute(async () => {
      store.setState({ ownerId: 'outer-modified' });

      const innerScope = new TransactionScope(() => store.getState(), applyPatch);
      const innerResult = await innerScope.executeResult(() => {
        store.setState({ ownerId: 'inner-dirty-crash' });
        throw new Error('FATAL_INNER_INVARIANT');
      });

      expect(innerResult.success).toBe(false);
      // Reverted to outer-modified state
      expect(store.getState().ownerId).toBe('outer-modified');
    });

    expect(store.getState().ownerId).toBe('outer-modified');
    expect(store.getState().trail).toHaveLength(1);
  });
});
