import { describe, expect, it } from 'vitest';
import { createTrailSlice } from './createTrailSlice';
import { createSliceTestHarness } from '../../../testing';
import type { TrailSliceActions } from '../../../types';

describe('trail edge cases and hostile conditions', () => {
  it('handles invalid or out-of-bound parent index during pushNested', () => {
    const harness = createSliceTestHarness<
      TrailSliceActions<unknown, unknown, string>,
      unknown,
      unknown,
      string
    >(createTrailSlice, {
      trail: [{ key: 'root-1', isLoading: false, error: null }],
    });

    // Positive index beyond bounds does not crash and leaves state unchanged
    harness.actions.pushNested(999, { key: 'orphan-child', isLoading: false, error: null });
    expect(harness.getState().trail).toHaveLength(1);
    expect(harness.getState().trail[0]?.key).toBe('root-1');

    // Negative out-of-bounds index
    harness.actions.pushNested(-5, { key: 'neg-child', isLoading: false, error: null });
    expect(harness.getState().trail).toHaveLength(1);
  });

  it('safely ignores closing non-existent or unmounted keys', () => {
    const harness = createSliceTestHarness<
      TrailSliceActions<unknown, unknown, string>,
      unknown,
      unknown,
      string
    >(createTrailSlice, {
      trail: [{ key: 'card-1', isLoading: false, error: null }],
      floating: [],
    });

    harness.actions.closeByKey('non-existent-key');
    expect(harness.getState().trail).toHaveLength(1);
    expect(harness.getState().trail[0]?.key).toBe('card-1');

    // Closing from negative index is a safe no-op
    harness.actions.closeFrom(-1);
    expect(harness.getState().trail).toHaveLength(1);

    // Closing topmost when trail and floating are empty
    harness.setState({ trail: [], floating: [] });
    harness.actions.closeTopmost();
    expect(harness.getState().trail).toHaveLength(0);
  });

  it('handles rapid clear while opening transitions occur', () => {
    const harness = createSliceTestHarness<
      TrailSliceActions<unknown, unknown, string>,
      unknown,
      unknown,
      string
    >(createTrailSlice, {
      trail: [{ key: 'step-1', isLoading: false, error: null }],
      floating: [{ key: 'pinned-card', isLoading: false, error: null }],
      pinnedStates: { 'pinned-card': true },
    });

    harness.actions.pushNested(1, {
      key: 'step-2',
      parentKey: 'step-1',
      isLoading: false,
      error: null,
    });

    // Rapid clearTrail preserves pinned floating card
    harness.actions.clearTrail();
    const stateAfterClear = harness.getState();
    expect(stateAfterClear.trail).toHaveLength(0);
    expect(stateAfterClear.floating).toHaveLength(1);
    expect(stateAfterClear.floating[0]?.key).toBe('pinned-card');

    // Rapid closeAll resets both floating and trail
    harness.actions.closeAll();
    const stateAfterCloseAll = harness.getState();
    expect(stateAfterCloseAll.trail).toHaveLength(0);
    expect(stateAfterCloseAll.floating).toHaveLength(0);
    expect(harness.getDAG()?.size).toBe(0);
  });

  it('ignores pushing nested when parent key does not exist via pushNestedByKey', () => {
    const harness = createSliceTestHarness<
      TrailSliceActions<unknown, unknown, string>,
      unknown,
      unknown,
      string
    >(createTrailSlice, {
      trail: [{ key: 'root-1', isLoading: false, error: null }],
    });

    harness.actions.pushNestedByKey('missing-parent', {
      key: 'child-orphan',
      isLoading: false,
      error: null,
    });
    expect(harness.getState().trail).toHaveLength(1);
  });
});
