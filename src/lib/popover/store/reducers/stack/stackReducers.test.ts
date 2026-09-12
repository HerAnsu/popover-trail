import { describe, it, expect } from 'vitest';
import {
  patchEntryInLists,
  updateEntryInLists,
  getSnapshotStatePatch,
  bringToFrontPatch,
  areEntriesShallowEqual,
} from './index';
import type { TrailEntry } from '../../../types';
import { createMockStoreState } from '../../../testing/createMockStoreState';

describe('stackReducers module', () => {
  const floating: TrailEntry[] = [{ key: 'f1', isLoading: true }];
  const trail: TrailEntry[] = [{ key: 't1', isLoading: true }];

  it('patches entry in floating list correctly', () => {
    const patch = patchEntryInLists(floating, [], 'f1', (e) => ({ ...e, isLoading: false }));
    expect(patch.floating?.[0]?.isLoading).toBe(false);
  });

  it('patches entry in trail list correctly', () => {
    const patch = patchEntryInLists([], trail, 't1', (e) => ({ ...e, isLoading: false }));
    expect(patch.trail?.[0]?.isLoading).toBe(false);
  });

  it('returns EMPTY_OBJECT if key is absent', () => {
    const patch = patchEntryInLists(floating, trail, 'missing', (e) => e);
    expect(patch).toEqual({});
  });

  it('updates entry with updated entry object', () => {
    const patch = updateEntryInLists(floating, trail, 't1', { key: 't1', isLoading: false });
    expect(patch.trail?.[0]?.isLoading).toBe(false);
  });

  it('restores snapshot correctly', () => {
    const snapshot = {
      trail: [{ key: 't1', isLoading: false }],
      floating: [],
      offsets: { t1: { x: 10, y: 10 } },
      pinnedStates: {},
      zIndexOrder: ['t1'],
      ownerId: 'owner-1',
    };

    const patch = getSnapshotStatePatch(snapshot);
    expect(patch.offsets).toEqual({ t1: { x: 10, y: 10 } });
    expect(patch.zIndexOrder).toEqual(['t1']);
    expect(patch.ownerId).toBe('owner-1');
  });

  it('brings key to front in zIndexOrder', () => {
    const state = createMockStoreState({
      trail: [
        { key: 'a', isLoading: false },
        { key: 'b', isLoading: false },
      ],
      zIndexOrder: ['a', 'b'],
    });

    const patch = bringToFrontPatch(state, 'a');
    expect(patch.zIndexOrder).toEqual(['b', 'a']);
  });

  it('evaluates entry shallow equality correctly', () => {
    const entry: TrailEntry = { key: 'k1', isLoading: false, data: 'abc' };
    expect(areEntriesShallowEqual(entry, { key: 'k1', isLoading: false, data: 'abc' })).toBe(true);
    expect(areEntriesShallowEqual(entry, { key: 'k1', isLoading: true })).toBe(false);
  });
});
