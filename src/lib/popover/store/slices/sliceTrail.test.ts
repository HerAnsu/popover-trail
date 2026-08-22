import { describe, it, expect, vi } from 'vitest';
import { createTrailSlice } from './sliceTrail';
import { PopoverDAG } from '../../utils/dag';
import { createMockSliceContext } from '../../testing/createMockSliceContext';

describe('sliceTrail module', () => {
  const createMockContext = () => {
    const pushSnapshot = vi.fn();
    const abortControllersForKeys = vi.fn();
    const popoverDAG = new PopoverDAG();
    popoverDAG.addNode('root-1');
    popoverDAG.addNode('child-1', 'root-1');

    let resetStoreState: () => void = () => {};

    const ctx = createMockSliceContext<unknown, unknown, string>(
      {
        floating: [],
        trail: [
          { key: 'root-1', isLoading: false, error: null },
          {
            key: 'child-1',
            parentKey: 'root-1',
            isLoading: false,
            error: null,
          },
        ],
        ownerId: 'owner-1',
        closePinnedDescendants: true,
        exitTransitionDuration: 0,
        offsets: {},
        pinnedStates: {},
        zIndexOrder: ['root-1', 'child-1'],
        nestedHydrationRequestCounters: {},
      },
      {
        abortControllersForKeys,
        pushSnapshot,
        popoverDAG,
      },
    );

    resetStoreState = vi.fn(() => {
      ctx.state = { ...ctx.state, trail: [], floating: [] };
      popoverDAG.clear();
    });

    ctx.deps.resetStoreState = resetStoreState;

    return { ctx, pushSnapshot, resetStoreState, popoverDAG, getState: () => ctx.state };
  };

  it('opens root popover and emits event', () => {
    const { ctx, pushSnapshot, getState } = createMockContext();
    const trailSlice = createTrailSlice(ctx);

    const newRoot = { key: 'new-root', isLoading: false, error: null };
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
    trailSlice.pushNested(0, {
      key: 'child-2',
      parentKey: 'root-1',
      isLoading: false,
      error: null,
    });

    expect(popoverDAG.hasNode('child-1')).toBe(false);
  });

  it('clearTrail preserves pinned floating cards when clearing the active trail', () => {
    const { ctx, getState } = createMockContext();
    // Add a pinned floating card and an active trail
    ctx.state = {
      ...ctx.state,
      floating: [{ key: 'pinned-win', isLoading: false, error: null }],
      pinnedStates: { 'pinned-win': true },
      trail: [{ key: 'trail-root', isLoading: false, error: null }],
      zIndexOrder: ['pinned-win', 'trail-root'],
    };

    const trailSlice = createTrailSlice(ctx);
    trailSlice.clearTrail();

    expect(getState().trail).toHaveLength(0);
    expect(getState().floating).toHaveLength(1);
    expect(getState().floating[0]?.key).toBe('pinned-win');
  });
});
