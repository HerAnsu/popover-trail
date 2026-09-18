import { describe, expect, it } from 'vitest';
import { createConfigSlice } from './createConfigSlice';
import { createSliceTestHarness } from '../../../testing';

describe('createConfigSlice module', () => {
  const createHarness = () =>
    createSliceTestHarness(createConfigSlice, {
      ownerId: 'initial-owner',
      baseZIndex: 1000,
      exitTransitionDuration: 200,
      mobileBreakpoint: 768,
      responsiveMode: 'auto',
      closePinnedDescendants: true,
      enableArrowNavigation: true,
    });

  it('updates basic scalar configuration properties', () => {
    const harness = createHarness();

    harness.actions.setOwnerId('new-owner');
    expect(harness.getState().ownerId).toBe('new-owner');

    harness.actions.setExitTransitionDuration(350);
    expect(harness.getState().exitTransitionDuration).toBe(350);

    harness.actions.setMobileBreakpoint(1024);
    expect(harness.getState().mobileBreakpoint).toBe(1024);

    harness.actions.setResponsiveMode('modal');
    expect(harness.getState().responsiveMode).toBe('modal');

    harness.actions.setClosePinnedDescendants(false);
    expect(harness.getState().closePinnedDescendants).toBe(false);

    harness.actions.setEnableArrowNavigation(false);
    expect(harness.getState().enableArrowNavigation).toBe(false);
  });

  it('updates CSS class names configuration via setGlobalAnimationClassNames', () => {
    const harness = createHarness();

    harness.actions.setGlobalAnimationClassNames('fade-in', 'fade-out', 'show');

    expect(harness.getState().mountingClassName).toBe('fade-in');
    expect(harness.getState().unmountingClassName).toBe('fade-out');
    expect(harness.getState().mountedClassName).toBe('show');
  });

  it('updates and diffs focus lock options and debug flags', () => {
    const harness = createHarness();

    harness.actions.setDebug(true);
    expect(harness.getState().debug).toBe(true);

    harness.actions.setFocusLockOptions({ returnFocus: false });
    expect(harness.getState().focusLockOptions).toEqual({ returnFocus: false });
  });

  it('updates stack group filter via setStackGroupFilter', () => {
    const harness = createHarness();

    harness.actions.setStackGroupFilter('sidebar-group');
    expect(harness.getState().activeStackGroup).toBe('sidebar-group');
  });

  it('updates cascade offset step and default offset configurations', () => {
    const harness = createHarness();

    harness.actions.setCascadeOffsetStep(20);
    expect(harness.getState().cascadeOffsetStep).toBe(20);

    harness.actions.setDefaultOffset(30);
    expect(harness.getState().defaultOffset).toBe(30);
  });
});
