import { describe, expect, it } from 'vitest';
import { createPersistenceSlice } from './createPersistenceSlice';
import { createSliceTestHarness } from '../../../testing';
import type { StateStorageEngine } from '../../../types';

describe('persistence rehydration resilience and sanitization', () => {
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

  it('rejects corrupted or malformed storage JSON gracefully', async () => {
    const { memory, storage } = createMockStorage();
    const harness = createSliceTestHarness(createPersistenceSlice);

    memory.set('bad-json', '{ "floating": [ invalid ...');
    expect(await harness.actions.rehydrateState({ storage, key: 'bad-json' })).toBe(false);

    memory.set('non-object', '42');
    expect(await harness.actions.rehydrateState({ storage, key: 'non-object' })).toBe(false);

    memory.set('missing-props', '{}');
    expect(await harness.actions.rehydrateState({ storage, key: 'missing-props' })).toBe(false);
  });

  it('guards against prototype pollution payloads during rehydration', async () => {
    const { memory, storage } = createMockStorage();
    const harness = createSliceTestHarness(createPersistenceSlice);

    const maliciousPayload = JSON.stringify({
      version: '1.1',
      floating: [
        { key: '__proto__', data: { isAdmin: true } },
        { key: 'constructor', data: { exploit: true } },
        { key: 'safe-card', data: { ok: true } },
      ],
      offsets: {
        __proto__: { x: 100, y: 100 },
        'safe-card': { x: 10, y: 20 },
      },
      zIndexOrder: ['__proto__', 'safe-card'],
    });

    memory.set('exploit-key', maliciousPayload);
    const ok = await harness.actions.rehydrateState({ storage, key: 'exploit-key' });

    expect(ok).toBe(true);
    expect(harness.getState().floating).toHaveLength(1);
    expect(harness.getState().floating[0]?.key).toBe('safe-card');
    expect(harness.getState().zIndexOrder).toEqual(['safe-card']);
    expect(({} as { isAdmin?: boolean }).isAdmin).toBeUndefined();
  });

  it('filters persisted keys when custom filter predicate is provided', async () => {
    const { memory, storage } = createMockStorage();
    const harness = createSliceTestHarness(createPersistenceSlice, {
      floating: [
        { key: 'persist-me', isLoading: false, error: null },
        { key: 'skip-me', isLoading: false, error: null },
      ],
      zIndexOrder: ['persist-me', 'skip-me'],
      offsets: { 'persist-me': { x: 5, y: 5 }, 'skip-me': { x: 99, y: 99 } },
    });

    await harness.actions.persistState({
      storage,
      key: 'filtered-state',
      filter: (key: unknown) => typeof key === 'string' && key.startsWith('persist-'),
    });

    const stored = JSON.parse(memory.get('filtered-state') ?? '{}');
    expect(stored.floating).toHaveLength(1);
    expect(stored.floating[0].key).toBe('persist-me');
    expect(stored.offsets['persist-me']).toEqual({ x: 5, y: 5 });
    expect(stored.offsets['skip-me']).toBeUndefined();
  });
});
