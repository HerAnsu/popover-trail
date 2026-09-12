import { describe, expect, it, vi } from 'vitest';
import { createPinningSlice } from './createPinningSlice';
import { createSliceTestHarness } from '../../../testing';

describe('createPinningSlice module', () => {
  const createHarness = () =>
    createSliceTestHarness(createPinningSlice, {
      floating: [],
      trail: [
        { key: 'p1', isLoading: false, error: null },
        { key: 'p2', isLoading: false, error: null },
      ],
      offsets: {},
      pinnedStates: { p2: true },
      zIndexOrder: ['p1', 'p2'],
    });

  it('toggles unpinned popover to pinned and emits pin event', () => {
    const harness = createHarness();
    const cancelAllSpy = vi.spyOn(harness.context.deps.transitionScheduler, 'cancelAllForKey');

    harness.actions.togglePin('p1');

    expect(harness.snapshots.length).toBeGreaterThan(0);
    expect(cancelAllSpy).toHaveBeenCalledWith('p1');
    expect(harness.emittedEvents).toContainEqual({ type: 'pin', key: 'p1' });
    expect(harness.getState().pinnedStates.p1).toBe(true);
  });

  it('toggles pinned floating popover back to unpinned trail entry', () => {
    const harness = createSliceTestHarness(createPinningSlice, {
      floating: [{ key: 'pinned-1', isLoading: false, error: null }],
      trail: [],
      pinnedStates: { 'pinned-1': true },
      zIndexOrder: ['pinned-1'],
    });

    harness.actions.togglePin('pinned-1');
    expect(harness.getState().pinnedStates['pinned-1']).toBe(false);
    expect(harness.getState().trail).toHaveLength(1);
    expect(harness.getState().floating).toHaveLength(0);
    expect(harness.emittedEvents).toContainEqual({ type: 'unpin', key: 'pinned-1' });
  });

  it('brings target key to the top of zIndexOrder', () => {
    const harness = createHarness();

    expect(harness.getState().zIndexOrder).toEqual(['p1', 'p2']);
    harness.actions.bringToFront('p1');
    expect(harness.getState().zIndexOrder).toEqual(['p2', 'p1']);
  });

  it('updates drag coordinates offset for specified key with numbers or object', () => {
    const harness = createHarness();

    harness.actions.updateOffset('p1', 50, 100);
    expect(harness.getState().offsets.p1).toEqual({ x: 50, y: 100 });

    harness.actions.updateOffset('p1', { x: 60, y: 120 });
    expect(harness.getState().offsets.p1).toEqual({ x: 60, y: 120 });
  });

  it('executes onPin lifecycle callback on togglePin', () => {
    const onPinMock = vi.fn();
    const harness = createSliceTestHarness(createPinningSlice, {
      trail: [{ key: 'p1', isLoading: false, error: null, onPin: onPinMock }],
      floating: [],
    });

    harness.actions.togglePin('p1');
    expect(onPinMock).toHaveBeenCalledWith('p1', true);
  });
});
