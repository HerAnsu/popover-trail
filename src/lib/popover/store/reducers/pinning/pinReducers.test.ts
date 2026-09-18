import { describe, it, expect } from 'vitest';
import { updateOffsetState, togglePinState } from './index';
import { createMockStoreState } from '../../../testing/createMockStoreState';

describe('pinReducers module', () => {
  it('updates offset coordinates for card', () => {
    const state = createMockStoreState({
      trail: [{ key: 't1', isLoading: false }],
    });
    const patch = updateOffsetState(state, 't1', { x: 50, y: 100 });
    expect(patch.offsets).toEqual({ t1: { x: 50, y: 100 } });
  });

  it('ignores non-finite offset values', () => {
    const state = createMockStoreState({
      trail: [{ key: 't1', isLoading: false }],
    });
    const patch = updateOffsetState(state, 't1', { x: Number.NaN, y: 100 });
    expect(patch).toEqual({});
  });

  it('toggles trail card into floating pinned card', () => {
    const state = createMockStoreState({
      trail: [{ key: 't1', isLoading: false }],
    });
    const patch = togglePinState(state, 't1');
    expect(patch.floating).toHaveLength(1);
    expect(patch.trail).toHaveLength(0);
    expect(patch.pinnedStates).toEqual({ t1: true });
  });

  it('toggles floating card back into cascade trail card', () => {
    const state = createMockStoreState({
      floating: [{ key: 'f1', isLoading: false }],
    });
    const patch = togglePinState(state, 'f1');
    expect(patch.floating).toHaveLength(0);
    expect(patch.trail).toHaveLength(1);
    expect(patch.pinnedStates).toEqual({ f1: false });
  });
});
