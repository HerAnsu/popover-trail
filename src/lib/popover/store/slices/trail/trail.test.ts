import { describe, expect, it, vi } from 'vitest';
import { createTrailSlice } from './createTrailSlice';
import { createSliceTestHarness } from '../../../testing';
import type { TrailSliceActions } from '../../../types';
import type { ActionRegistryDependencies } from '../../storeActionRegistry';

describe('createTrailSlice module', () => {
  const setupHarness = (
    depOverrides?: Partial<ActionRegistryDependencies<unknown, unknown, string>>,
  ) => {
    const harness = createSliceTestHarness<
      TrailSliceActions<unknown, unknown, string>,
      unknown,
      unknown,
      string
    >(
      createTrailSlice,
      {
        floating: [],
        trail: [
          { key: 'root-1', isLoading: false, error: null },
          { key: 'child-1', parentKey: 'root-1', isLoading: false, error: null },
        ],
        ownerId: 'owner-1',
        closePinnedDescendants: true,
        zIndexOrder: ['root-1', 'child-1'],
      },
      depOverrides,
    );
    harness.getDAG()?.addNode('root-1');
    harness.getDAG()?.addNode('child-1', 'root-1');
    return harness;
  };

  it('opens root popover and emits event with snapshot', () => {
    const harness = setupHarness();
    harness.actions.openRoot('owner-2', { key: 'new-root', isLoading: false, error: null });
    expect(harness.snapshots.length).toBeGreaterThan(0);
    expect(harness.getState().ownerId).toBe('owner-2');
    expect(harness.getState().trail[0]?.key).toBe('new-root');
  });

  it('closes popovers from target index and removes nodes from PopoverDAG', () => {
    const harness = setupHarness();
    expect(harness.getDAG()?.hasNode('child-1')).toBe(true);
    harness.actions.closeFrom(0);
    expect(harness.getState().trail).toHaveLength(0);
    expect(harness.getDAG()?.hasNode('child-1')).toBe(false);
    expect(harness.getDAG()?.hasNode('root-1')).toBe(false);
  });

  it('clears trail and resets store state on closeAll and clears DAG', () => {
    const resetSpy = vi.fn();
    const harness = setupHarness({ resetStoreState: resetSpy });
    harness.actions.closeAll();
    expect(resetSpy).toHaveBeenCalled();
    expect(harness.getDAG()?.size).toBe(0);
  });

  it('closes single popover by key via closeByKey and cleans DAG', () => {
    const harness = setupHarness();
    harness.actions.closeByKey('child-1');
    expect(harness.getState().trail).toHaveLength(1);
    expect(harness.getState().trail[0]?.key).toBe('root-1');
    expect(harness.getDAG()?.hasNode('child-1')).toBe(false);
    expect(harness.getDAG()?.hasNode('root-1')).toBe(true);
  });

  it('prunes truncated DAG nodes when pushing nested popover on shallow parent index', () => {
    const harness = setupHarness();
    expect(harness.getDAG()?.hasNode('child-1')).toBe(true);
    harness.actions.pushNested(0, {
      key: 'child-2',
      parentKey: 'root-1',
      isLoading: false,
      error: null,
    });
    expect(harness.getDAG()?.hasNode('child-1')).toBe(false);
  });

  it('clearTrail preserves pinned floating cards when clearing the active trail', () => {
    const harness = setupHarness();
    harness.setState({
      floating: [{ key: 'pinned-win', isLoading: false, error: null }],
      pinnedStates: { 'pinned-win': true },
      trail: [{ key: 'trail-root', isLoading: false, error: null }],
    });
    harness.actions.clearTrail();
    expect(harness.getState().trail).toHaveLength(0);
    expect(harness.getState().floating).toHaveLength(1);
    expect(harness.getState().floating[0]?.key).toBe('pinned-win');
  });
});
