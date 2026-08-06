import { describe, it, expect } from 'vitest';
import { InternalPopoverState } from './storeTypes';

describe('storeTypes module', () => {
  it('validates store type signatures and erased internal state type', () => {
    const mockState: InternalPopoverState = {
      trail: [],
      floating: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: [],
      rootHydrationRequestCounter: 0,
      nestedHydrationRequestCounters: {},
      ownerId: null,
      anchorElement: null,
      anchorRect: null,
      context: null,
      closePinnedDescendants: false,
      collisionConfig: null,
      cache: null,
      resolveData: () => ({}),
      enableArrowNavigation: true,
      debug: false,
      cascadeOffsetStep: 8,
      exitTransitionDuration: 0,
      defaultOffset: 8,
      baseZIndex: 1000,
      mountingClassName: '',
      unmountingClassName: '',
      mountedClassName: '',
      activeStackGroup: null,
      responsiveMode: 'auto',
      mobileBreakpoint: 768,
      components: null,
      zIndexBaseMap: {},
      allowDragWhenPinned: true,
      allowDragWhenUnpinned: true,
      focusLockOptions: null,
    };

    expect(mockState.trail).toBeDefined();
    expect(mockState.baseZIndex).toBe(1000);
  });
});
