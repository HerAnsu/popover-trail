import { describe, it, expect, vi } from 'vitest';
import { createTrailSlice } from './sliceTrail';
import type { SliceContext } from './sliceContext';
import type { PopoverStateData, TrailEntry } from '../../types';
import { PopoverDAG } from '../../utils/dag';

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
    const popoverDAG = new PopoverDAG();
    popoverDAG.addNode('root-1');
    popoverDAG.addNode('child-1', 'root-1');

    const resetStoreState = vi.fn(() => {
      state.trail = [];
      state.floating = [];
      popoverDAG.clear();
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
        popoverDAG,
      } as unknown,
    };

    return { ctx, pushSnapshot, resetStoreState, popoverDAG, getState: () => state };
  };

  it('opens root popover and emits event', () => {
    const { ctx, pushSnapshot, getState } = createMockContext();
    const trailSlice = createTrailSlice(ctx);

    const newRoot = { key: 'new-root', isLoading: false, error: null } as TrailEntry<unknown>;
    trailSlice.openRoot('owner-2', newRoot);

    expect(pushSnapshot).toHaveBeenCalled();
    expect(getState().ownerId).toBe('owner-2');
  });

  it('closes popovers from target index and removes nodes from PopoverDAG', () => {
    const { ctx, popoverDAG, getState } = createMockContext();
    const trailSlice = createTrailSlice(ctx);

    expect(popoverDAG.hasNode('child-1')).toBe(true);

    trailSlice.closeFrom(0);
    expect(getState().trail).toHaveLength(0);
    expect(popoverDAG.hasNode('child-1')).toBe(false);
    expect(popoverDAG.hasNode('root-1')).toBe(false);
  });

  it('clears trail and resets store state on closeAll and clears DAG', () => {
    const { ctx, resetStoreState, popoverDAG } = createMockContext();
    const trailSlice = createTrailSlice(ctx);

    trailSlice.closeAll();
    expect(resetStoreState).toHaveBeenCalled();
    expect(popoverDAG.size).toBe(0);
  });

  it('closes single popover by key via closeByKey and cleans DAG', () => {
    const { ctx, popoverDAG, getState } = createMockContext();
    const trailSlice = createTrailSlice(ctx);

    trailSlice.closeByKey('child-1');
    expect(getState().trail).toHaveLength(1);
    expect(getState().trail[0]?.key).toBe('root-1');
    expect(popoverDAG.hasNode('child-1')).toBe(false);
    expect(popoverDAG.hasNode('root-1')).toBe(true);
  });

  it('prunes truncated DAG nodes when pushing nested popover on shallow parent index', () => {
    const { ctx, popoverDAG } = createMockContext();
    const trailSlice = createTrailSlice(ctx);

    expect(popoverDAG.hasNode('child-1')).toBe(true);

    // Push new child directly from root-1 (index 0 in trail), truncating child-1
    trailSlice.pushNested(0, { key: 'child-2', parentKey: 'root-1' });

    expect(popoverDAG.hasNode('child-1')).toBe(false);
  });
});
