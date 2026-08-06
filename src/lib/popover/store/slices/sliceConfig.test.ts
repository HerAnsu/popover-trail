import { describe, it, expect, vi } from 'vitest';
import { createConfigSlice } from './sliceConfig';
import { SliceContext } from './sliceContext';
import { PopoverStateData, TrailEntry } from '../../types';

describe('sliceConfig module', () => {
  const createMockSliceContext = (): SliceContext<unknown, unknown, string> => {
    let mockState: Partial<PopoverStateData<unknown, unknown>> = {
      context: null,
      ownerId: null,
      floating: [],
      trail: [
        {
          key: 'card-1',
          transitionStatus: 'mounting',
          isLoading: false,
          error: null,
        } as TrailEntry<unknown>,
      ],
      pinnedStates: {},
      baseZIndex: 1000,
      debug: false,
    };

    const get = () => mockState as PopoverStateData<unknown, unknown>;
    const set = (
      updater:
        | Partial<PopoverStateData<unknown, unknown>>
        | ((s: PopoverStateData<unknown, unknown>) => Partial<PopoverStateData<unknown, unknown>>),
    ) => {
      const patch = typeof updater === 'function' ? updater(get()) : updater;
      mockState = { ...mockState, ...patch };
    };

    return {
      get,
      set,
      deps: {
        activeControllers: new Map(),
        inFlightPromises: new Map(),
        hoverCloseTimers: new Map(),
        clearHoverTimer: vi.fn(),
        findEntryByKey: (key: string) => mockState.trail?.find((e) => e.key === key),
      },
    } as unknown as SliceContext<unknown, unknown, string>;
  };

  it('updates debug mode and baseZIndex configuration', () => {
    const ctx = createMockSliceContext();
    const slice = createConfigSlice(ctx);

    slice.setDebug(true);
    expect(ctx.get().debug).toBe(true);

    slice.setBaseZIndex(2000);
    expect(ctx.get().baseZIndex).toBe(2000);
  });

  it('ignores invalid baseZIndex values', () => {
    const ctx = createMockSliceContext();
    const slice = createConfigSlice(ctx);

    slice.setBaseZIndex(-500);
    expect(ctx.get().baseZIndex).toBe(1000);
  });

  it('updates transitionStatus for valid FSM transitions', () => {
    const ctx = createMockSliceContext();
    const slice = createConfigSlice(ctx);

    slice.setTransitionStatus('card-1', 'mounted');
    expect(ctx.get().trail[0]?.transitionStatus).toBe('mounted');
  });

  it('sets context object with deep equality check', () => {
    const ctx = createMockSliceContext();
    const slice = createConfigSlice(ctx);

    slice.setContext({ user: 'Alice' });
    expect(ctx.get().context).toEqual({ user: 'Alice' });
  });

  it('sets responsiveMode and mobileBreakpoint configuration values', () => {
    const ctx = createMockSliceContext();
    const slice = createConfigSlice(ctx);

    slice.setResponsiveMode('bottom-sheet');
    expect(ctx.get().responsiveMode).toBe('bottom-sheet');

    slice.setMobileBreakpoint(768);
    expect(ctx.get().mobileBreakpoint).toBe(768);
  });

  it('updates global animation class names via setGlobalAnimationClassNames', () => {
    const ctx = createMockSliceContext();
    const slice = createConfigSlice(ctx);

    slice.setGlobalAnimationClassNames('fade-in', 'fade-out', 'active');
    expect(ctx.get().mountingClassName).toBe('fade-in');
    expect(ctx.get().unmountingClassName).toBe('fade-out');
    expect(ctx.get().mountedClassName).toBe('active');
  });
});
