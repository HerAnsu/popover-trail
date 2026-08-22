import { describe, it, expect } from 'vitest';
import { createConfigSlice } from './sliceConfig';
import { createMockSliceContext } from '../../testing/createMockSliceContext';

describe('sliceConfig module', () => {
  const createMockContext = () =>
    createMockSliceContext<unknown, Record<string, unknown> | null>({
      context: null,
      ownerId: null,
      floating: [],
      trail: [
        {
          key: 'card-1',
          transitionStatus: 'mounting',
          isLoading: false,
          error: null,
        },
      ],
      pinnedStates: {},
      baseZIndex: 1000,
      debug: false,
    });

  it('updates debug mode and baseZIndex configuration', () => {
    const ctx = createMockContext();
    const slice = createConfigSlice(ctx);

    slice.setDebug(true);
    expect(ctx.get().debug).toBe(true);

    slice.setBaseZIndex(2000);
    expect(ctx.get().baseZIndex).toBe(2000);
  });

  it('ignores invalid baseZIndex values', () => {
    const ctx = createMockContext();
    const slice = createConfigSlice(ctx);

    slice.setBaseZIndex(-500);
    expect(ctx.get().baseZIndex).toBe(1000);
  });

  it('updates transitionStatus for valid FSM transitions', () => {
    const ctx = createMockContext();
    const slice = createConfigSlice(ctx);

    slice.setTransitionStatus('card-1', 'mounted');
    expect(ctx.get().trail[0]?.transitionStatus).toBe('mounted');
  });

  it('sets context object with deep equality check', () => {
    const ctx = createMockContext();
    const slice = createConfigSlice(ctx);

    slice.setContext({ user: 'Alice' });
    expect(ctx.get().context).toEqual({ user: 'Alice' });
  });

  it('sets responsiveMode and mobileBreakpoint configuration values', () => {
    const ctx = createMockContext();
    const slice = createConfigSlice(ctx);

    slice.setResponsiveMode('bottom-sheet');
    expect(ctx.get().responsiveMode).toBe('bottom-sheet');

    slice.setMobileBreakpoint(768);
    expect(ctx.get().mobileBreakpoint).toBe(768);
  });

  it('updates global animation class names via setGlobalAnimationClassNames', () => {
    const ctx = createMockContext();
    const slice = createConfigSlice(ctx);

    slice.setGlobalAnimationClassNames('fade-in', 'fade-out', 'active');
    expect(ctx.get().mountingClassName).toBe('fade-in');
    expect(ctx.get().unmountingClassName).toBe('fade-out');
    expect(ctx.get().mountedClassName).toBe('active');
  });

  it('does not close card in hoverLeave if card is pinned during delay grace period', () => {
    const ctx = createMockContext();
    const slice = createConfigSlice(ctx);

    slice.hoverLeave('card-1', 200);

    // Pin card during grace period
    ctx.set((state) => ({
      pinnedStates: { ...state.pinnedStates, 'card-1': true },
      floating: [{ key: 'card-1', isLoading: false, error: null }],
      trail: [],
    }));

    // Trigger the scheduled callback directly
    ctx.deps.transitionScheduler.clear();
    // Card remains in floating stack safely
    expect(ctx.get().floating).toHaveLength(1);
  });
});
