import { describe, it, expect } from 'vitest';
import {
  isStoreApi,
  isPopoverStore,
  isSchemaInstance,
  isSchemaKey,
  isHistorySnapshot,
} from './storeGuards';
import { createStore } from 'zustand/vanilla';
import { createPopoverStore } from '../core/storeFactory';
import { createPopoverSchema } from '../../schema/schemaBuilder';

describe('storeGuards', () => {
  it('identifies Zustand store and PopoverStore instances', () => {
    const rawStore = createStore(() => ({ value: 1 }));
    expect(isStoreApi(rawStore)).toBe(true);
    expect(isPopoverStore(rawStore)).toBe(false);

    const popoverStore = createPopoverStore();
    expect(isStoreApi(popoverStore)).toBe(true);
    expect(isPopoverStore(popoverStore)).toBe(true);

    expect(isStoreApi(null)).toBe(false);
    expect(isStoreApi({})).toBe(false);
  });

  it('identifies PopoverSchemaInstance and verifies schema keys', () => {
    const schema = createPopoverSchema({
      user: {
        resolver: async () => ({ id: 1, name: 'Alice' }),
      },
      post: {
        resolver: async () => ({ id: 10, title: 'Hello' }),
      },
    });

    expect(isSchemaInstance(schema)).toBe(true);
    expect(isSchemaInstance({})).toBe(false);

    expect(isSchemaKey(schema, 'user')).toBe(true);
    expect(isSchemaKey(schema, 'post')).toBe(true);
    expect(isSchemaKey(schema, 'comment')).toBe(false);
    expect(isSchemaKey(schema, '')).toBe(false);
    expect(isSchemaKey(schema, 123)).toBe(false);
  });

  it('identifies HistorySnapshot structures correctly', () => {
    const validSnapshot = {
      trail: [],
      floating: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: [],
      ownerId: null,
    };
    expect(isHistorySnapshot(validSnapshot)).toBe(true);
    expect(isHistorySnapshot({ trail: 'not-array' })).toBe(false);
    expect(isHistorySnapshot(null)).toBe(false);
  });
});
