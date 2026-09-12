import { describe, it, expect, vi } from 'vitest';
import { createPopoverStore } from '../../core/storeFactory';
import type { TrailEntry } from '../../../types';

describe('dagActions in trail slice', () => {
  it('adds multi-parent edge and updates entry.parentKeys in reactive state', () => {
    const store = createPopoverStore();
    const entryA: TrailEntry = { key: 'cardA' };
    const entryB: TrailEntry = { key: 'cardB' };
    const entryC: TrailEntry = { key: 'cardC' };

    store.getState().openRoot('owner-1', entryA);
    store.getState().pushNested(0, entryC); // C is child of A

    expect(store.getState().getParents('cardC').has('cardA')).toBe(true);

    store.getState().openRoot('owner-1', entryB);

    // Add secondary parent B -> C
    const added = store.getState().addEdge('cardB', 'cardC');
    expect(added).toBe(true);

    const parents = store.getState().getParents('cardC');
    expect(parents.has('cardA')).toBe(true);
    expect(parents.has('cardB')).toBe(true);
    expect(parents.size).toBe(2);

    // Check reactive state entry
    const entry = store.getState().trail.find((e) => e.key === 'cardC');
    expect(entry?.parentKeys).toBeDefined();
    const hasB =
      entry?.parentKeys instanceof Set
        ? entry.parentKeys.has('cardB')
        : (entry?.parentKeys as readonly string[] | undefined)?.includes('cardB');
    expect(hasB).toBe(true);
  });

  it('prevents cycle creation across multi-parent paths', () => {
    const store = createPopoverStore();
    const entryA: TrailEntry = { key: 'A' };
    const entryB: TrailEntry = { key: 'B' };
    const entryC: TrailEntry = { key: 'C' };

    store.getState().openRoot('owner-1', entryA);
    store.getState().pushNested(0, entryB); // A -> B
    store.getState().pushNested(1, entryC); // B -> C

    // Attempting C -> A cycle
    const cycleAdded = store.getState().addEdge('C', 'A');
    expect(cycleAdded).toBe(false);
  });

  it('removes single edge and emits event without breaking sibling parents', () => {
    const store = createPopoverStore();
    const listener = vi.fn();
    store.getState().subscribeEvent(listener);

    store.getState().openRoot('owner-1', { key: 'P1' });
    store.getState().openRoot('owner-1', { key: 'P2' });
    store.getState().addEdge('P1', 'Child');
    store.getState().addEdge('P2', 'Child');

    expect(store.getState().getParents('Child').size).toBe(2);

    store.getState().removeEdge('P1', 'Child');
    expect(store.getState().getParents('Child').has('P1')).toBe(false);
    expect(store.getState().getParents('Child').has('P2')).toBe(true);

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'dag_edge_removed',
        parentKey: 'P1',
        childKey: 'Child',
      }),
    );
  });

  it('retrieves geodesic breadcrumb path and children', () => {
    const store = createPopoverStore();
    store.getState().openRoot('owner-1', { key: 'root' });
    store.getState().pushNested(0, { key: 'step1' });
    store.getState().pushNested(1, { key: 'step2' });

    const path = store.getState().getGeodesicPath('step2');
    expect(path).toEqual(['root', 'step1', 'step2']);

    const rootChildren = store.getState().getChildren('root');
    expect(rootChildren.has('step1')).toBe(true);

    expect(store.getDAG()).toBeDefined();
    expect(store.getState().getDAG()).toBeDefined();
  });
});
