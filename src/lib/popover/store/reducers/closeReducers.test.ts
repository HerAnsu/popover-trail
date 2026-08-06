import { describe, it, expect } from 'vitest';
import { closeFromState, getRemovedKeysForClose } from './closeReducers';
import { PopoverStateData, TrailEntry } from '../../types';

describe('closeReducers module', () => {
  const createMockState = (): PopoverStateData<unknown, unknown> =>
    ({
      ownerId: 'owner-1',
      floating: [{ key: 'pinned-1', isLoading: false, error: null } as TrailEntry<unknown>],
      trail: [
        { key: 'root-1', isLoading: false, error: null } as TrailEntry<unknown>,
        {
          key: 'child-1',
          parentKey: 'root-1',
          isLoading: false,
          error: null,
        } as TrailEntry<unknown>,
      ],
      pinnedStates: { 'pinned-1': true },
      offsets: { 'pinned-1': { x: 0, y: 0 } },
      zIndexOrder: ['pinned-1', 'root-1', 'child-1'],
      closePinnedDescendants: true,
      nestedHydrationRequestCounters: {},
    }) as unknown as PopoverStateData<unknown, unknown>;

  it('returns empty object if index is out of bounds', () => {
    const state = createMockState();
    expect(closeFromState(state, -1)).toEqual({});
    expect(closeFromState(state, 100)).toEqual({});
    expect(getRemovedKeysForClose(state.floating, state.trail, -1, true)).toBeNull();
  });

  it('closes floating card when floating index is targeted', () => {
    const state = createMockState();
    const result = closeFromState(state, 0); // index 0 is floating pinned-1

    expect(result.floating).toHaveLength(0);
    expect(result.pinnedStates?.['pinned-1']).toBeUndefined();
  });

  it('closes trail popovers and descendants when trail index is targeted', () => {
    const state = createMockState();
    const result = closeFromState(state, 1); // index 1 is root-1 in trail

    expect(result.trail).toHaveLength(0);
  });

  it('closes child entry at index 2 without removing parent root-1 at index 1', () => {
    const state = createMockState();
    const result = closeFromState(state, 2); // index 2 is child-1 in trail

    expect(result.trail).toHaveLength(1);
    expect(result.trail?.[0]?.key).toBe('root-1');
  });

  it('preserves pinned descendants when closePinnedDescendants is false', () => {
    const state = createMockState();
    state.closePinnedDescendants = false;
    // Make pinned-1 a child of root-1
    (state.floating[0] as unknown as { parentKey?: string }).parentKey = 'root-1';

    const result = closeFromState(state, 1); // Close root-1
    // floating should still contain pinned-1 because closePinnedDescendants is false
    expect(result.floating).toHaveLength(1);
    expect(result.floating?.[0]?.key).toBe('pinned-1');
  });
});
