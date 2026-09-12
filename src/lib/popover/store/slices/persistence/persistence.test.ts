import { describe, expect, it, vi } from 'vitest';
import { createPersistenceSlice } from './createPersistenceSlice';
import { createSliceTestHarness } from '../../../testing';
import type { PopoverCache, StateStorageEngine } from '../../../types';

describe('createPersistenceSlice module', () => {
  const createMockStorage = () => {
    const memory = new Map<string, string>();
    const storage: StateStorageEngine = {
      getItem: (k) => memory.get(k) ?? null,
      setItem: (k, v) => {
        memory.set(k, v);
      },
      removeItem: (k) => {
        memory.delete(k);
      },
    };
    return { memory, storage };
  };

  it('persists versioned snapshot and rehydrates state correctly', async () => {
    const { memory, storage } = createMockStorage();
    const harness = createSliceTestHarness(createPersistenceSlice, {
      floating: [{ key: 'p1', isLoading: false, error: null, data: { title: 'Test 1' } }],
      offsets: { p1: { x: 10, y: 20 } },
      pinnedStates: { p1: true },
      zIndexOrder: ['p1'],
    });

    await harness.actions.persistState({ storage, key: 'test_save' });
    const rawStored = memory.get('test_save');
    expect(rawStored).toBeDefined();
    expect(rawStored).toContain('"version":1');
    expect(rawStored).toContain('p1');

    harness.setState({ floating: [], offsets: {}, pinnedStates: {}, zIndexOrder: [] });
    const rehydrated = await harness.actions.rehydrateState({ storage, key: 'test_save' });
    expect(rehydrated).toBe(true);

    const { floating, offsets, pinnedStates } = harness.getState();
    expect(floating).toHaveLength(1);
    expect(floating[0]?.key).toBe('p1');
    expect(offsets.p1).toEqual({ x: 10, y: 20 });
    expect(pinnedStates.p1).toBe(true);
  });

  it('restores PopoverDAG hierarchy nodes on rehydrateState', async () => {
    const { memory, storage } = createMockStorage();
    const harness = createSliceTestHarness(createPersistenceSlice);

    const payload = JSON.stringify({
      version: 1,
      floating: [{ key: 'pinned-root' }, { key: 'pinned-child', parentKey: 'pinned-root' }],
      offsets: {},
      pinnedStates: { 'pinned-root': true, 'pinned-child': true },
      zIndexOrder: ['pinned-root', 'pinned-child'],
    });

    memory.set('dag_rehydrate_test', payload);
    const ok = await harness.actions.rehydrateState({ storage, key: 'dag_rehydrate_test' });

    expect(ok).toBe(true);
    expect(harness.getDAG()?.hasNode('pinned-root')).toBe(true);
    expect(harness.getDAG()?.hasNode('pinned-child')).toBe(true);
    expect(harness.getDAG()?.getAncestors('pinned-child')).toContain('pinned-root');
  });

  it('cleans up abort controllers, event listeners, history and cache on destroy', () => {
    const clearHistorySpy = vi.fn();
    const resetStoreSpy = vi.fn();
    const cacheClearSpy = vi.fn();
    const listener = vi.fn();

    const mockCache: PopoverCache = {
      get: vi.fn(),
      set: vi.fn(),
      has: vi.fn(),
      delete: vi.fn(),
      clear: cacheClearSpy,
      destroy: cacheClearSpy,
    };

    const harness = createSliceTestHarness(
      createPersistenceSlice,
      {},
      { clearHistory: clearHistorySpy, resetStoreState: resetStoreSpy, cache: mockCache },
    );

    harness.context.deps.eventListeners.add(listener);
    harness.actions.destroy();

    expect(clearHistorySpy).toHaveBeenCalled();
    expect(resetStoreSpy).toHaveBeenCalled();
    expect(cacheClearSpy).toHaveBeenCalled();
    expect(harness.context.deps.eventListeners.size).toBe(0);
  });
});
