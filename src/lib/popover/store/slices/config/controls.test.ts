import { describe, expect, it } from 'vitest';
import { createControlsSlice, type ControlsSliceActions } from './controls';
import { createSliceTestHarness } from '../../../testing';

describe('createControlsSlice module', () => {
  const createHarness = () =>
    createSliceTestHarness<
      ControlsSliceActions<unknown, unknown, string>,
      unknown,
      unknown,
      string
    >(createControlsSlice, {
      floating: [],
      trail: [
        {
          key: 'c1',
          isLoading: false,
          error: null,
          buttonControls: { enableClose: true, enablePin: true },
        },
      ],
    });

  it('updates card button controls for target trail entry', () => {
    const harness = createHarness();

    harness.actions.setButtonControls('c1', { enableClose: false, enablePin: false });
    expect(harness.getState().trail[0]?.buttonControls).toEqual({
      enableClose: false,
      enablePin: false,
    });
  });

  it('toggles individual button control flags', () => {
    const harness = createHarness();

    harness.actions.setButtonControls('c1', { enableClose: false, enablePin: false });

    harness.actions.toggleButtonControl('c1', 'enableClose', true);
    expect(harness.getState().trail[0]?.buttonControls?.enableClose).toBe(true);

    harness.actions.toggleButtonControl('c1', 'enablePin', true);
    expect(harness.getState().trail[0]?.buttonControls?.enablePin).toBe(true);
  });

  it('updates button controls on pinned floating cards', () => {
    const harness = createSliceTestHarness<
      ControlsSliceActions<unknown, unknown, string>,
      unknown,
      unknown,
      string
    >(createControlsSlice, {
      floating: [
        {
          key: 'f1',
          isLoading: false,
          error: null,
          buttonControls: { enableClose: true, enablePin: true },
        },
      ],
      trail: [],
    });

    harness.actions.setButtonControls('f1', { enableClose: false });
    expect(harness.getState().floating[0]?.buttonControls?.enableClose).toBe(false);

    harness.actions.toggleButtonControl('f1', 'enablePin', false);
    expect(harness.getState().floating[0]?.buttonControls?.enablePin).toBe(false);
  });

  it('safely ignores updates when entry key does not exist', () => {
    const harness = createHarness();

    harness.actions.setButtonControls('missing-key', { enableClose: false });
    expect(harness.getState().trail[0]?.buttonControls?.enableClose).toBe(true);

    harness.actions.toggleButtonControl('missing-key', 'enableClose', false);
    expect(harness.getState().trail[0]?.buttonControls?.enableClose).toBe(true);
  });
});
