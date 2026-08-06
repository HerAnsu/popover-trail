import { describe, it, expect, vi } from 'vitest';
import { createTrailSlice } from './sliceTrail';
import { SliceContext } from './sliceContext';
import { PopoverStateData, TrailEntry } from '../../types';

describe('sliceTrail module', () => {
  const createMockContext = () => {
    let state = {
      floating: [],
      trail: [
        { key: 'root-1', isLoading: false, error: null } as TrailEntry<unknown>,
        {
          key: 'child-1',
          parentKey: 'root-1',
          isLoading: false,
          error: null,
        } as TrailEntry<unknown>,
      ],
      ownerId: 'owner-1',
      closePinnedDescendants: true,
      exitTransitionDuration: 0,
      offsets: {},
      pinnedStates: {},
      zIndexOrder: ['root-1', 'child-1'],
      nestedHydrationRequestCounters: {},
    } as unknown as PopoverStateData<unknown, unknown>;

    const pushSnapshot = vi.fn();
    const abortControllersForKeys = vi.fn();
    const resetStoreState = vi.fn(() => {
      state.trail = [];
      state.floating = [];
    });

    const ctx: SliceContext<unknown, unknown, string> = {
      get: () => state,
      set: (patch) => {
        const next = typeof patch === 'function' ? patch(state) : patch;
        state = { ...state, ...next };
      },
      deps: {
        activeControllers: new Map(),
        transitionTimers: new Map(),
        eventListeners: new Set(),
        clearTransitionTimer: vi.fn(),
        abortControllersForKeys,
        resetStoreState,
        findEntryByKey: (key: string) => state.trail.find((e) => e.key === key),
        pushSnapshot,
      } as unknown,
    };

    return { ctx, pushSnapshot, resetStoreState, getState: () => state };
  };

  it('opens root popover and emits event', () => {
    const { ctx, pushSnapshot, getState } = createMockContext();
    const trailSlice = createTrailSlice(ctx);

    const newRoot = { key: 'new-root', isLoading: false, error: null } as TrailEntry<unknown>;
    trailSlice.openRoot('owner-2', newRoot);

    expect(pushSnapshot).toHaveBeenCalled();
    expect(getState().ownerId).toBe('owner-2');
  });

  it('closes popovers from target index', () => {
    const { ctx, getState } = createMockContext();
    const trailSlice = createTrailSlice(ctx);

    trailSlice.closeFrom(0);
    expect(getState().trail).toHaveLength(0);
  });

  it('clears trail and resets store state on closeAll', () => {
    const { ctx, resetStoreState } = createMockContext();
    const trailSlice = createTrailSlice(ctx);

    trailSlice.closeAll();
    expect(resetStoreState).toHaveBeenCalled();
  });

  it('closes single popover by key via closeByKey', () => {
    const { ctx, getState } = createMockContext();
    const trailSlice = createTrailSlice(ctx);

    trailSlice.closeByKey('child-1');
    expect(getState().trail).toHaveLength(1);
    expect(getState().trail[0]?.key).toBe('root-1');
  });

  it('does nothing safely when closeByKey is called for missing key', () => {
    const { ctx, getState } = createMockContext();
    const trailSlice = createTrailSlice(ctx);

    trailSlice.closeByKey('non-existent');
    expect(getState().trail).toHaveLength(2);
  });
});
