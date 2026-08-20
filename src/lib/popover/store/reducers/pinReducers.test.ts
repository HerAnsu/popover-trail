import { describe, it, expect } from 'vitest';
import { togglePinState, updateOffsetState } from './pinReducers';
import type { PopoverStateData } from '../../types';
import { createMockStoreState } from '../../testing/createMockStoreState';

describe('pinReducers module', () => {
  const createMockState = (
    overrides?: Partial<PopoverStateData<unknown, unknown>>,
  ): PopoverStateData<unknown, unknown> =>
    createMockStoreState<unknown, unknown>({
      ownerId: 'owner-1',
      floating: [],
      trail: [{ key: 'card-1', isLoading: false, error: null }],
      pinnedStates: { 'card-1': false },
      offsets: { 'card-1': { x: 10, y: 20 } },
      zIndexOrder: ['card-1'],
      nestedHydrationRequestCounters: {},
      ...overrides,
    });

  it('updates offset coordinates accurately via pure updateOffsetState', () => {
    const state = createMockState();
    const patch = updateOffsetState(state, 'card-1', { x: 100, y: 200 });

    expect(patch.offsets?.['card-1']).toEqual({ x: 100, y: 200 });

    // Returns empty patch if coordinates have not changed
    const noopPatch = updateOffsetState(state, 'card-1', { x: 10, y: 20 });
    expect(noopPatch).toEqual({});
  });

  it('pins an unpinned popover from trail into floating state', () => {
    const state = createMockState();
    const result = togglePinState(state, 'card-1');

    expect(result.floating).toHaveLength(1);
    expect(result.trail).toHaveLength(0);
    expect(result.pinnedStates?.['card-1']).toBe(true);
  });

  it('unpins a floating popover back into trail state', () => {
    const state = createMockState({
      floating: [{ key: 'card-1', isLoading: false, error: null }],
      trail: [],
      pinnedStates: { 'card-1': true },
    });

    const result = togglePinState(state, 'card-1');

    expect(result.floating).toHaveLength(0);
    expect(result.trail).toHaveLength(1);
    expect(result.pinnedStates?.['card-1']).toBe(false);
  });
});
