import { describe, it, expect, vi } from 'vitest';
import { createPersistenceSlice } from './slicePersistence';
import { SliceContext } from './sliceContext';
import { PopoverStateData } from '../../types';

describe('slicePersistence module', () => {
  const createMockContext = () => {
    let state = {
      floating: [{ key: 'p1' }],
      trail: [],
      offsets: { p1: { x: 10, y: 20 } },
      pinnedStates: { p1: true },
      zIndexOrder: ['p1'],
      ownerId: 'owner-1',
      actions: {} as unknown,
    } as unknown as PopoverStateData<unknown, unknown>;

    const listeners = new Set();
    const mockStorage = new Map<string, string>();

    const storageEngine = {
      getItem: async (key: string) => mockStorage.get(key) ?? null,
      setItem: async (key: string, val: string) => {
        mockStorage.set(key, val);
      },
    };

    const ctx: SliceContext<unknown, unknown, string> = {
      get: () => state,
      set: (patch) => {
        const next = typeof patch === 'function' ? patch(state) : patch;
        state = { ...state, ...next };
      },
      deps: {
        activeControllers: new Map(),
        eventListeners: listeners,
        resetStoreState: vi.fn(),
        clearHistory: vi.fn(),
        startBatch: vi.fn(),
        endBatch: vi.fn(),
        middlewareEngine: { use: vi.fn() },
      } as unknown,
    };

    return { ctx, storageEngine, mockStorage, getState: () => state };
  };

  it('persists floating popovers and rehydrates state correctly', async () => {
    const { ctx, storageEngine, getState } = createMockContext();
    const persistence = createPersistenceSlice(ctx);

    await persistence.persistState({ storage: storageEngine, key: 'test_save' });
    expect(await storageEngine.getItem('test_save')).toContain('p1');

    // Reset state and rehydrate
    ctx.set({ floating: [], offsets: {}, pinnedStates: {}, zIndexOrder: [] });
    expect(getState().floating).toHaveLength(0);

    const ok = await persistence.rehydrateState({ storage: storageEngine, key: 'test_save' });
    expect(ok).toBe(true);
    expect(getState().floating).toHaveLength(1);
    expect(getState().floating[0]?.key).toBe('p1');
  });

  it('subscribes and unsubscribes event listeners', () => {
    const { ctx } = createMockContext();
    const persistence = createPersistenceSlice(ctx);
    const listener = vi.fn();

    const unsub = persistence.subscribeEvent(listener);
    expect(ctx.deps.eventListeners.has(listener)).toBe(true);

    unsub();
    expect(ctx.deps.eventListeners.has(listener)).toBe(false);
  });
});
