import { describe, it, expect } from 'vitest';
import {
  filterRecord,
  getNextZIndexOrder,
  getAllDescendants,
  bringToFrontPatch,
  getCleanupStatePatch,
  updateEntryInLists,
} from './stackReducers';
import type { TrailEntry } from '../../types';
import { createMockStoreState } from '../../testing/createMockStoreState';

describe('stackReducers module (Structural Sharing & Stack Operations)', () => {
  it('filterRecord preserves original object reference if no keys were stripped', () => {
    const record = { a: 1, b: 2 };
    const allowed = new Set(['a', 'b', 'c']);
    const filtered = filterRecord(record, allowed);

    expect(filtered).toBe(record);
  });

  it('updateEntryInLists preserves unchanged array references (Structural Sharing)', () => {
    const floating: TrailEntry[] = [
      { key: 'f1', isLoading: false },
      { key: 'f2', isLoading: false },
    ];
    const trail: TrailEntry[] = [{ key: 't1', isLoading: false }];

    const patchFloating = updateEntryInLists(floating, trail, 'f1', {
      key: 'f1',
      isLoading: true,
    });

    expect(patchFloating.floating).not.toBe(floating);
    expect(patchFloating.trail).toBe(trail);

    const patchTrail = updateEntryInLists(floating, trail, 't1', {
      key: 't1',
      isLoading: true,
    });

    expect(patchTrail.trail).not.toBe(trail);
    expect(patchTrail.floating).toBe(floating);

    const noopPatch = updateEntryInLists(floating, trail, 'f1', {
      key: 'f1',
      isLoading: false,
    });
    expect(noopPatch).toEqual({});
  });

  it('getNextZIndexOrder preserves array reference if target key is already top-most', () => {
    const zIndexOrder = ['k1', 'k2', 'k3'];
    const activeKeys = new Set(['k1', 'k2', 'k3']);

    const nextOrder = getNextZIndexOrder(zIndexOrder, activeKeys, 'k3');
    expect(nextOrder).toBe(zIndexOrder);
  });

  it('getAllDescendants resolves deep descendant tree with zero intermediate Map allocations', () => {
    const trail: TrailEntry[] = [
      { key: 'root', isLoading: false },
      { key: 'child', parentKey: 'root', isLoading: false },
      { key: 'grandchild', parentKey: 'child', isLoading: false },
    ];

    const descendants = getAllDescendants(['root'], [], trail);
    expect(descendants.has('child')).toBe(true);
    expect(descendants.has('grandchild')).toBe(true);
    expect(descendants.size).toBe(2);
  });

  it('bringToFrontPatch elevates target popover and its descendants in zIndexOrder', () => {
    const state = createMockStoreState({
      floating: [],
      trail: [
        { key: 'a', isLoading: false, error: null },
        { key: 'b', isLoading: false, error: null },
        { key: 'a-child', parentKey: 'a', isLoading: false, error: null },
      ],
      pinnedStates: {},
      zIndexOrder: ['a', 'a-child', 'b'],
    });

    const patch = bringToFrontPatch(state, 'a');
    expect(patch.zIndexOrder).toEqual(['b', 'a', 'a-child']);
  });

  it('getCleanupStatePatch cleans up orphaned keys and resets ownerId when empty', () => {
    const patch = getCleanupStatePatch([], [], { k1: { x: 0, y: 0 } }, ['k1'], { k1: true }, {});

    expect(patch.zIndexOrder).toEqual([]);
    expect(patch.ownerId).toBeNull();
    expect(patch.offsets).toEqual({});
  });
});
