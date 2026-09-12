import { describe, expect, it, vi } from 'vitest';
import { createHoverSlice } from './hover';
import { createSliceTestHarness } from '../../../testing';

describe('createHoverSlice module', () => {
  const createHarness = () => {
    const harness = createSliceTestHarness(createHoverSlice, {
      floating: [],
      trail: [
        { key: 'parent', isLoading: false, error: null },
        { key: 'child', parentKey: 'parent', isLoading: false, error: null },
      ],
      pinnedStates: {},
    });

    const dag = harness.getDAG();
    dag?.addNode('parent');
    dag?.addNode('child', 'parent');
    return harness;
  };

  it('hoverEnter cancels hover for target key and all ancestor keys in DAG', () => {
    const harness = createHarness();
    const cancelHoverSpy = vi.spyOn(harness.context.deps.transitionScheduler, 'cancelHover');

    harness.actions.hoverEnter('child');
    expect(cancelHoverSpy).toHaveBeenCalledWith('child');
    expect(cancelHoverSpy).toHaveBeenCalledWith('parent');
  });

  it('hoverLeave schedules close timer for unpinned popovers', () => {
    const harness = createHarness();
    const scheduleHoverLeaveSpy = vi.spyOn(
      harness.context.deps.transitionScheduler,
      'scheduleHoverLeave',
    );

    harness.actions.hoverLeave('parent', 150);
    expect(scheduleHoverLeaveSpy).toHaveBeenCalledWith('parent', 150, expect.any(Function));
  });

  it('hoverLeave skips scheduling close timer for pinned popovers', () => {
    const harness = createHarness();
    harness.setState({ pinnedStates: { parent: true } });

    const scheduleHoverLeaveSpy = vi.spyOn(
      harness.context.deps.transitionScheduler,
      'scheduleHoverLeave',
    );

    harness.actions.hoverLeave('parent', 150);
    expect(scheduleHoverLeaveSpy).not.toHaveBeenCalled();
  });

  it('cancelHover explicitly calls cancelHover on transitionScheduler', () => {
    const harness = createHarness();
    const cancelHoverSpy = vi.spyOn(harness.context.deps.transitionScheduler, 'cancelHover');

    harness.actions.cancelHover('child');
    expect(cancelHoverSpy).toHaveBeenCalledWith('child');
  });

  it('hoverEnter handles isolated node without ancestors safely', () => {
    const harness = createHarness();
    const cancelHoverSpy = vi.spyOn(harness.context.deps.transitionScheduler, 'cancelHover');

    harness.actions.hoverEnter('parent');
    expect(cancelHoverSpy).toHaveBeenCalledWith('parent');
    expect(cancelHoverSpy).toHaveBeenCalledTimes(1);
  });
});
