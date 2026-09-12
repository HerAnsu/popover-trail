import { describe, expect, it } from 'vitest';
import { createLifecycleSlice, type LifecycleSliceActions } from './lifecycle';
import { createSliceTestHarness } from '../../../testing';

type TestActions = LifecycleSliceActions<unknown, unknown, string>;

describe('createLifecycleSlice module', () => {
  const createHarness = () =>
    createSliceTestHarness<TestActions, unknown, unknown, string>(createLifecycleSlice, {
      floating: [],
      trail: [{ key: 'card-1', isLoading: false, error: null, transitionStatus: 'mounted' }],
    });

  it('updates transitionStatus of target trail popover across all phases', () => {
    const harness = createHarness();

    harness.actions.setTransitionStatus('card-1', 'unmounting');
    expect(harness.getState().trail[0]?.transitionStatus).toBe('unmounting');

    harness.actions.setTransitionStatus('card-1', 'mounting');
    expect(harness.getState().trail[0]?.transitionStatus).toBe('mounting');

    harness.actions.setTransitionStatus('card-1', 'mounted');
    expect(harness.getState().trail[0]?.transitionStatus).toBe('mounted');
  });

  it('updates transitionStatus of pinned floating cards', () => {
    const harness = createSliceTestHarness<TestActions, unknown, unknown, string>(
      createLifecycleSlice,
      {
        floating: [{ key: 'float-1', isLoading: false, error: null, transitionStatus: 'mounted' }],
        trail: [],
      },
    );

    harness.actions.setTransitionStatus('float-1', 'unmounting');
    expect(harness.getState().floating[0]?.transitionStatus).toBe('unmounting');
  });

  it('safely handles non-existent or empty card keys during lifecycle transitions', () => {
    const harness = createHarness();

    harness.actions.setTransitionStatus('non-existent-key', 'unmounting');
    expect(harness.getState().trail[0]?.transitionStatus).toBe('mounted');

    harness.actions.setTransitionStatus('', 'unmounting');
    expect(harness.getState().trail[0]?.transitionStatus).toBe('mounted');
  });

  it('preserves other trail entries when mutating target card status', () => {
    const harness = createSliceTestHarness<TestActions, unknown, unknown, string>(
      createLifecycleSlice,
      {
        floating: [],
        trail: [
          { key: 'card-1', isLoading: false, error: null, transitionStatus: 'mounted' },
          { key: 'card-2', isLoading: false, error: null, transitionStatus: 'mounted' },
        ],
      },
    );

    harness.actions.setTransitionStatus('card-2', 'unmounting');
    expect(harness.getState().trail[0]?.transitionStatus).toBe('mounted');
    expect(harness.getState().trail[1]?.transitionStatus).toBe('unmounting');
  });

  it('updates lifecycle state across mixed trail and floating list topologies', () => {
    const harness = createSliceTestHarness<TestActions, unknown, unknown, string>(
      createLifecycleSlice,
      {
        floating: [{ key: 'f1', isLoading: false, error: null, transitionStatus: 'mounted' }],
        trail: [{ key: 't1', isLoading: false, error: null, transitionStatus: 'mounted' }],
      },
    );

    harness.actions.setTransitionStatus('f1', 'unmounting');
    expect(harness.getState().floating[0]?.transitionStatus).toBe('unmounting');
    expect(harness.getState().trail[0]?.transitionStatus).toBe('mounted');

    harness.actions.setTransitionStatus('t1', 'unmounting');
    expect(harness.getState().trail[0]?.transitionStatus).toBe('unmounting');
  });
});
