import { describe, it, expect, vi } from 'vitest';
import { createPersistenceSlice, type StateStorageEngine } from './slicePersistence';
import { createMockSliceContext } from '../../testing/createMockSliceContext';

describe('slicePersistence module', () => {
  const createMockContext = () => {
    const mockStorage = new Map<string, string>();

    const storage: StateStorageEngine = {
      getItem: async (key: string) => mockStorage.get(key) ?? null,
      setItem: async (key: string, val: string) => {
        mockStorage.set(key, val);
      },
      removeItem: async (key: string) => {
        mockStorage.delete(key);
      },
      clear: async () => {
        mockStorage.clear();
      },
    };

    const ctx = createMockSliceContext<unknown, unknown, string>({
      floating: [{ key: 'p1', isLoading: false, error: null }],
      trail: [],
      offsets: { p1: { x: 10, y: 20 } },
      pinnedStates: { p1: true },
      zIndexOrder: ['p1'],
      ownerId: 'owner-1',
    });

    return {
      ctx,
      storageEngine: storage,
      storage,
      mockStorage,
      getState: () => ctx.state,
    };
  };

  it('persists versioned snapshot with 1.0.3 tag and rehydrates state correctly', async () => {
    const { ctx, storageEngine, storage, getState } = createMockContext();
    const persistence = createPersistenceSlice(ctx);

    await persistence.persistState({ storage, key: 'test_save' });
    const rawStored = await storageEngine.getItem('test_save');

    expect(rawStored).toContain('"version":"1.1"');
    expect(rawStored).toContain('"timestamp"');
    expect(rawStored).toContain('p1');

    // Reset store state and rehydrate
    ctx.set({ floating: [], offsets: {}, pinnedStates: {}, zIndexOrder: [] });
    expect(getState().floating).toHaveLength(0);

    const ok = await persistence.rehydrateState({ storage, key: 'test_save' });
    expect(ok).toBe(true);
    expect(getState().floating).toHaveLength(1);
    expect(getState().floating[0]?.key).toBe('p1');
    expect(getState().offsets['p1']).toEqual({ x: 10, y: 20 });
  });

  it('safely rejects prototype pollution keys in persisted payloads', async () => {
    const { ctx, storageEngine, storage, getState } = createMockContext();
    const persistence = createPersistenceSlice(ctx);

    const maliciousPayload = JSON.stringify({
      version: '1.0.3',
      floating: [{ key: '__proto__' }, { key: 'constructor' }, { key: 'valid-node' }],
      offsets: {
        __proto__: { x: 100, y: 100 },
        'valid-node': { x: 50, y: 50 },
      },
      pinnedStates: { 'valid-node': true },
      zIndexOrder: ['__proto__', 'valid-node'],
    });

    await storageEngine.setItem('malicious_save', maliciousPayload);

    const ok = await persistence.rehydrateState({ storage, key: 'malicious_save' });
    expect(ok).toBe(true);

    // Only valid-node is rehydrated, __proto__ is completely stripped
    expect(getState().floating).toHaveLength(1);
    expect(getState().floating[0]?.key).toBe('valid-node');
    expect(getState().offsets['valid-node']).toEqual({ x: 50, y: 50 });
    expect(getState().zIndexOrder).toEqual(['valid-node']);
  });

  it('handles corrupt JSON gracefully without crashing', async () => {
    const { ctx, storageEngine, storage } = createMockContext();
    const persistence = createPersistenceSlice(ctx);

    await storageEngine.setItem('corrupt_key', 'INVALID_MALFORMED_JSON_%%%');

    const ok = await persistence.rehydrateState({ storage, key: 'corrupt_key' });
    expect(ok).toBe(false);
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
