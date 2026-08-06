import { describe, it, expect } from 'vitest';
import {
  filterRecord,
  getActiveKeys,
  getNextZIndexOrder,
  getParentChildMap,
  getAllDescendants,
  bringToFrontPatch,
  getCleanupStatePatch,
} from './stackReducers';
import { TrailEntry, PopoverStateData } from '../../types';

describe('stackReducers module', () => {
  it('filterRecord removes unallowed keys and prototype pollution properties', () => {
    const record = { a: 1, b: 2, c: 3 };
    const allowed = new Set(['a', 'c']);
    const filtered = filterRecord(record, allowed);

    expect(filtered).toEqual({ a: 1, c: 3 });
    expect(filtered).not.toHaveProperty('b');
  });

  it('getActiveKeys collects keys from floating and trail lists', () => {
    const floating = [{ key: 'f1' }, { key: 'f2' }] as TrailEntry<unknown>[];
    const trail = [{ key: 't1' }] as TrailEntry<unknown>[];

    const keys = getActiveKeys(floating, trail);
    expect(keys.has('f1')).toBe(true);
    expect(keys.has('f2')).toBe(true);
    expect(keys.has('t1')).toBe(true);
    expect(keys.size).toBe(3);
  });

  it('getNextZIndexOrder appends new key at top of active z-index list', () => {
    const zIndexOrder = ['k1', 'k2'];
    const activeKeys = new Set(['k1', 'k2', 'k3']);
    const nextOrder = getNextZIndexOrder(zIndexOrder, activeKeys, 'k3');

    expect(nextOrder).toEqual(['k1', 'k2', 'k3']);
  });

  it('getParentChildMap groups children under parent keys', () => {
    const trail = [
      { key: 'root' },
      { key: 'child1', parentKey: 'root' },
      { key: 'child2', parentKey: 'root' },
    ] as TrailEntry<unknown>[];

    const map = getParentChildMap([], trail);
    const rootChildren = map.get('root');

    expect(rootChildren).toHaveLength(2);
    expect(rootChildren?.[0]?.key).toBe('child1');
  });

  it('getAllDescendants resolves deep descendant tree', () => {
    const trail = [
      { key: 'root' },
      { key: 'child', parentKey: 'root' },
      { key: 'grandchild', parentKey: 'child' },
    ] as TrailEntry<unknown>[];

    const descendants = getAllDescendants(['root'], [], trail);
    expect(descendants.has('child')).toBe(true);
    expect(descendants.has('grandchild')).toBe(true);
  });

  it('bringToFrontPatch elevates target popover and its descendants in zIndexOrder', () => {
    const state = {
      floating: [],
      trail: [{ key: 'a' }, { key: 'b' }, { key: 'a-child', parentKey: 'a' }],
      pinnedStates: {},
      zIndexOrder: ['a', 'a-child', 'b'],
    } as unknown as PopoverStateData<unknown, unknown>;

    const patch = bringToFrontPatch(state, 'a');
    expect(patch.zIndexOrder).toEqual(['b', 'a', 'a-child']);
  });

  it('getCleanupStatePatch cleans up orphaned keys and resets ownerId when empty', () => {
    const patch = getCleanupStatePatch([], [], { k1: { x: 0, y: 0 } }, ['k1'], { k1: true }, {});

    expect(patch.zIndexOrder).toEqual([]);
    expect(patch.ownerId).toBeNull();
    expect(patch.offsets).toEqual({});
  });

  it('bringToFrontPatch returns empty object when target key is not in zIndexOrder', () => {
    const state = {
      floating: [],
      trail: [{ key: 'a' }],
      pinnedStates: {},
      zIndexOrder: ['a'],
    } as unknown as PopoverStateData<unknown, unknown>;

    const patch = bringToFrontPatch(state, 'non-existent');
    expect(patch).toEqual({});
  });

  it('filterRecord handles empty record gracefully', () => {
    expect(filterRecord({}, new Set(['a']))).toEqual({});
  });
});
