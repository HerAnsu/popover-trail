import { describe, expect, it } from 'vitest';
import { createPinningSlice } from './createPinningSlice';
import { createSliceTestHarness } from '../../../testing';
import type { DragOffset, PinningSliceActions } from '../../../types';

type TestActions = PinningSliceActions<unknown, unknown, string>;

describe('pinning offsets and edge case handling', () => {
  it('updates drag coordinates using functional offset updaters', () => {
    const harness = createSliceTestHarness<TestActions, unknown, unknown, string>(
      createPinningSlice,
      { offsets: { card1: { x: 25, y: 35 } } },
    );

    // Update existing offset with updater function
    harness.actions.updateOffset('card1', (curr: DragOffset) => ({
      x: curr.x + 15,
      y: curr.y - 10,
    }));
    expect(harness.getState().offsets.card1).toEqual({ x: 40, y: 25 });

    // Fallback to { x: 0, y: 0 } for uninitialized card key
    harness.actions.updateOffset('card2', (curr: DragOffset) => ({
      x: curr.x + 50,
      y: curr.y + 100,
    }));
    expect(harness.getState().offsets.card2).toEqual({ x: 50, y: 100 });
  });

  it('sanitizes and rejects NaN and non-finite offset coordinates', () => {
    const harness = createSliceTestHarness<TestActions, unknown, unknown, string>(
      createPinningSlice,
      { offsets: { card1: { x: 10, y: 20 } } },
    );

    // NaN in numeric arguments
    harness.actions.updateOffset('card1', Number.NaN, 50);
    expect(harness.getState().offsets.card1).toEqual({ x: 10, y: 20 });

    harness.actions.updateOffset('card1', 50, Number.NaN);
    expect(harness.getState().offsets.card1).toEqual({ x: 10, y: 20 });

    // NaN in object argument
    harness.actions.updateOffset('card1', { x: Number.NaN, y: 30 });
    expect(harness.getState().offsets.card1).toEqual({ x: 10, y: 20 });

    // Infinity coordinates
    harness.actions.updateOffset('card1', Number.POSITIVE_INFINITY, 0);
    expect(harness.getState().offsets.card1).toEqual({ x: 10, y: 20 });

    // Functional updater returning NaN
    harness.actions.updateOffset('card1', () => ({ x: Number.NaN, y: Number.NaN }));
    expect(harness.getState().offsets.card1).toEqual({ x: 10, y: 20 });
  });

  it('safely handles toggling and bringing to front unmounted or unpinned entries', () => {
    const harness = createSliceTestHarness<TestActions, unknown, unknown, string>(
      createPinningSlice,
      {
        trail: [{ key: 'active-1', isLoading: false, error: null, transitionStatus: 'mounted' }],
        floating: [],
        zIndexOrder: ['active-1'],
      },
    );

    // Toggling non-existent key is a no-op
    harness.actions.togglePin('non-existent');
    expect(harness.getState().pinnedStates['non-existent']).toBeUndefined();
    expect(harness.snapshots).toHaveLength(0);

    // Empty key is a no-op
    harness.actions.togglePin('');
    expect(harness.snapshots).toHaveLength(0);

    // Bring to front on unmounted key
    harness.actions.bringToFront('missing-key');
    expect(harness.getState().zIndexOrder).toEqual(['active-1']);

    // Bring to front on unmounting entry
    harness.setState({
      trail: [{ key: 'dying-1', isLoading: false, error: null, transitionStatus: 'unmounting' }],
      zIndexOrder: ['active-1', 'dying-1'],
    });
    harness.actions.bringToFront('dying-1');
    expect(harness.getState().zIndexOrder).toEqual(['active-1', 'dying-1']);
  });
});
