import { describe, it, expect } from 'vitest';
import {
  hasTrailState,
  hasFloatingState,
  hasPinnedState,
  hasZIndexState,
  hasLifecycleState,
  hasAnchorState,
} from './sliceGuards';

describe('sliceGuards', () => {
  it('validates HasTrailState and HasFloatingState slices', () => {
    expect(hasTrailState({ trail: [], ownerId: 'root-owner' })).toBe(true);
    expect(hasTrailState({ trail: [], ownerId: null })).toBe(true);
    expect(hasTrailState({ trail: 'not-array' })).toBe(false);

    expect(hasFloatingState({ floating: [] })).toBe(true);
    expect(hasFloatingState({ floating: {} })).toBe(false);
  });

  it('validates HasPinnedState and HasZIndexState slices', () => {
    expect(hasPinnedState({ pinnedStates: {}, offsets: {} })).toBe(true);
    expect(hasPinnedState({ pinnedStates: null })).toBe(false);

    expect(hasZIndexState({ zIndexOrder: ['card-1'], baseZIndex: 1000 })).toBe(true);
    expect(hasZIndexState({ zIndexOrder: [], baseZIndex: Number.NaN })).toBe(false);
  });

  it('validates HasLifecycleState and HasAnchorState slices', () => {
    const lifecycle = {
      rootHydrationRequestCounter: 0,
      nestedHydrationRequestCounters: {},
      mountingClassName: 'popover-enter',
      unmountingClassName: 'popover-exit',
      mountedClassName: 'popover-active',
    };
    expect(hasLifecycleState(lifecycle)).toBe(true);
    expect(hasLifecycleState({ ...lifecycle, rootHydrationRequestCounter: '0' })).toBe(false);

    expect(hasAnchorState({ anchorElement: null, anchorRect: null })).toBe(true);
    expect(hasAnchorState({})).toBe(false);
  });
});
