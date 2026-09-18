import { describe, it, expect } from 'vitest';
import { closeFromState, closeByTargetKeyState, getRemovedKeysForClose } from './index';
import { createMockStoreState } from '../../../testing/createMockStoreState';

describe('closeReducers module', () => {
  it('closes from trail index removing target and descendants', () => {
    const state = createMockStoreState({
      trail: [
        { key: 't1', isLoading: false },
        { key: 't2', parentKey: 't1', isLoading: false },
      ],
    });
    const patch = closeFromState(state, 0);
    expect(patch.trail).toEqual([]);
  });

  it('closes from floating index removing only floating card when closePinnedDescendants is false', () => {
    const state = createMockStoreState({
      floating: [{ key: 'f1', isLoading: false }],
      trail: [{ key: 't1', isLoading: false }],
    });
    const patch = closeFromState(state, 0);
    expect(patch.floating).toEqual([]);
    expect(patch.trail).toHaveLength(1);
  });

  it('closes by target key directly', () => {
    const state = createMockStoreState({
      trail: [{ key: 't1', isLoading: false }],
    });
    const patch = closeByTargetKeyState(state, 't1');
    expect(patch.trail).toEqual([]);
  });

  it('computes removed keys for close calculation accurately', () => {
    const floating = [{ key: 'f1', isLoading: false }];
    const trail = [
      { key: 't1', isLoading: false },
      { key: 't2', parentKey: 't1', isLoading: false },
    ];
    const result = getRemovedKeysForClose(floating, trail, 1, false);
    expect(result?.removedKeys.has('t1')).toBe(true);
    expect(result?.removedKeys.has('t2')).toBe(true);
  });
});
