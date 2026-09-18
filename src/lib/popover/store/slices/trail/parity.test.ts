import { describe, expect, it } from 'vitest';
import { createTrailSlice } from './createTrailSlice';
import { createSliceTestHarness } from '../../../testing';

/**
 * Golden parity contract: `closeFrom` and `clearTrail` are two entry points onto
 * the same shared close pipeline. Their observable outcomes — surviving lists,
 * cleanup of derived collections, and history snapshotting — must stay identical
 * for the equivalent key set, so the funnel cannot silently drift apart.
 */
describe('trail close parity (closeFrom vs clearTrail)', () => {
  const createHarness = () => {
    const harness = createSliceTestHarness(createTrailSlice, {
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
    });

    const dag = harness.getDAG();
    dag?.addNode('root-1');
    dag?.addNode('child-1', 'root-1');

    return harness;
  };

  const projectState = (harness: ReturnType<typeof createHarness>) => {
    const { trail, floating, zIndexOrder, ownerId } = harness.getState();
    return {
      trailKeys: trail.map(({ key }) => key),
      floatingKeys: floating.map(({ key }) => key),
      zIndexOrder: [...zIndexOrder],
      ownerId,
    };
  };

  it('closeFrom(0) and clearTrail() converge on the same end state and history depth', () => {
    // Run 1: close from the root index.
    const viaCloseFrom = createHarness();
    viaCloseFrom.actions.closeFrom(0);

    // Run 2: clear the whole trail.
    const viaClearTrail = createHarness();
    viaClearTrail.actions.clearTrail();

    expect(projectState(viaCloseFrom)).toEqual(projectState(viaClearTrail));
    expect(viaClearTrail.getState().trail).toHaveLength(0);

    // Both paths push snapshots before mutating.
    expect(viaCloseFrom.snapshots.length).toBeGreaterThan(0);
    expect(viaClearTrail.snapshots.length).toBeGreaterThan(0);
    expect(viaCloseFrom.snapshots).toHaveLength(viaClearTrail.snapshots.length);
  });

  it('preserves pinned states equally across both close pathways', () => {
    const viaCloseFrom = createHarness();
    viaCloseFrom.setState({ pinnedStates: { 'root-1': false, 'child-1': false } });
    viaCloseFrom.actions.closeFrom(0);

    const viaClearTrail = createHarness();
    viaClearTrail.setState({ pinnedStates: { 'root-1': false, 'child-1': false } });
    viaClearTrail.actions.clearTrail();

    expect(viaCloseFrom.getState().pinnedStates).toEqual(viaClearTrail.getState().pinnedStates);
  });
});
