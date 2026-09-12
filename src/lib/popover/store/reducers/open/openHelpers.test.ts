import { describe, it, expect } from 'vitest';
import { buildActiveTrailPatch, computeNextTrailForNestedPush } from './index';
import { createMockStoreState } from '../../../testing/createMockStoreState';

describe('openHelpers module', () => {
  it('builds active trail patch with clean records and elevated z-index', () => {
    const state = createMockStoreState({
      trail: [{ key: 't1', isLoading: false }],
      zIndexOrder: ['t1'],
    });
    const patch = buildActiveTrailPatch(
      state,
      [
        { key: 't1', isLoading: false },
        { key: 't2', isLoading: false },
      ],
      't2',
    );
    expect(patch.trail).toHaveLength(2);
    expect(patch.zIndexOrder).toEqual(['t1', 't2']);
  });

  it('computes next trail for floating nested push', () => {
    const state = createMockStoreState({ floating: [{ key: 'f1', isLoading: false }] });
    const nextTrail = computeNextTrailForNestedPush(state, 0, {
      key: 'nested-1',
      isLoading: false,
    });
    expect(nextTrail).toEqual([{ key: 'nested-1', isLoading: false }]);
  });

  it('computes next trail for trail nested push slicing ancestors', () => {
    const state = createMockStoreState({
      trail: [
        { key: 't1', isLoading: false },
        { key: 't2', isLoading: false },
        { key: 't3', isLoading: false },
      ],
    });
    const nextTrail = computeNextTrailForNestedPush(state, 1, { key: 't4', isLoading: false });
    expect(nextTrail).toHaveLength(3);
    expect(nextTrail?.map((e) => e.key)).toEqual(['t1', 't2', 't4']);
  });
});
