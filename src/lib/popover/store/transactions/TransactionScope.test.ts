import { describe, it, expect, vi } from 'vitest';
import { TransactionScope } from './TransactionScope';
import { PopoverDAG } from '../../utils/dag';
import type { StatePatch } from '../../types';

import { createMockStoreState } from '../../testing/createMockStoreState';

describe('TransactionScope', () => {
  const createMockStore = () => {
    let state = createMockStoreState<unknown, unknown, string>({
      trail: [{ key: 'p1', isLoading: false, error: null }],
      floating: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: ['p1'],
      ownerId: 'initial',
      anchorElement: null,
      anchorRect: null,
    });

    const set = vi.fn((patch: StatePatch<unknown, unknown, string>) => {
      state = { ...state, ...patch };
    });
    const getState = () => state;
    const dag = new PopoverDAG();
    dag.addNode('p1');

    return { getState, set, dag };
  };

  it('commits successfully when action succeeds in execute', async () => {
    const { getState, set, dag } = createMockStore();
    const scope = new TransactionScope(getState, set, dag);

    const result = await scope.execute(async () => {
      set({ ownerId: 'updated' });
      return 42;
    });

    expect(result).toBe(42);
    expect(getState().ownerId).toBe('updated');
  });

  it('rolls back state when action throws in execute', async () => {
    const { getState, set, dag } = createMockStore();
    const scope = new TransactionScope(getState, set, dag);

    await expect(
      scope.execute(async () => {
        set({ ownerId: 'corrupted' });
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: 'initial',
      }),
    );
  });

  it('returns Ok result on success in executeResult', async () => {
    const { getState, set, dag } = createMockStore();
    const scope = new TransactionScope(getState, set, dag);

    const res = await scope.executeResult(async () => 'success-val');
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data).toBe('success-val');
    }
  });

  it('returns Err result and rolls back on failure in executeResult', async () => {
    const { getState, set, dag } = createMockStore();
    const scope = new TransactionScope(getState, set, dag);

    const res = await scope.executeResult(async () => {
      set({ ownerId: 'broken' });
      throw new Error('failed task');
    });

    expect(res.success).toBe(false);
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: 'initial',
      }),
    );
  });
});
