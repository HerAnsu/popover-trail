import { describe, it, expect } from 'vitest';
import { createTrailSlice } from './sliceTrail';
import { PopoverDAG } from '../../utils/dag';
import { createMockSliceContext } from '../../testing/createMockSliceContext';

/**
 * Golden parity contract: `closeFrom` and `clearTrail` are two entry points onto
 * the same shared close pipeline. Their observable outcomes — surviving lists,
 * cleanup of derived collections, and history snapshotting — must stay identical
 * for the equivalent key set, so the funnel cannot silently drift apart.
 */
describe('sliceTrail close parity (closeFrom vs clearTrail)', () => {
  const createContext = () => {
    const popoverDAG = new PopoverDAG();
    popoverDAG.addNode('root-1');
    popoverDAG.addNode('child-1', 'root-1');

    const ctx = createMockSliceContext<unknown, unknown, string>(
      {
        floating: [],
        trail: [
          { key: 'root-1', isLoading: false, error: null },
          { key: 'child-1', parentKey: 'root-1', isLoading: false, error: null },
        ],
        ownerId: 'owner-1',
        closePinnedDescendants: true,
        exitTransitionDuration: 0,
        offsets: {},
        pinnedStates: {},
        zIndexOrder: ['root-1', 'child-1'],
        nestedHydrationRequestCounters: {},
      },
      { popoverDAG },
    );

    ctx.deps.resetStoreState = () => {
      ctx.state = { ...ctx.state, trail: [], floating: [] };
      popoverDAG.clear();
    };

    return ctx;
  };

  const projectState = (ctx: ReturnType<typeof createContext>) => ({
    trailKeys: ctx.state.trail.map((e) => e.key),
    floatingKeys: ctx.state.floating.map((e) => e.key),
    zIndexOrder: [...ctx.state.zIndexOrder],
    ownerId: ctx.state.ownerId,
  });

  it('closeFrom(0) and clearTrail() converge on the same end state and history depth', () => {
    // Run 1: close from the root index.
    const viaCloseFrom = createContext();
    createTrailSlice(viaCloseFrom).closeFrom(0);

    // Run 2: clear the whole trail.
    const viaClearTrail = createContext();
    createTrailSlice(viaClearTrail).clearTrail();

    expect(projectState(viaCloseFrom)).toEqual(projectState(viaClearTrail));
    expect(viaClearTrail.state.trail).toHaveLength(0);

    // Both paths push exactly one undo snapshot before mutating.
    expect(viaCloseFrom.deps.historyManager?.undoStack.length).toBe(
      viaClearTrail.deps.historyManager?.undoStack.length,
    );
  });
});
