import { describe, it, expect } from 'vitest';
import { createPopoverStore } from './store';
import { PopoverDAG } from './utils/dag';
import { createHistoryManager } from './store/history';

describe('Store Engine Optimization Unit Tests', () => {
  it('PopoverDAG builds directed graph and traverses descendant subtrees', () => {
    const dag = new PopoverDAG();
    dag.addNode('root');
    dag.addNode('child-1', 'root');
    dag.addNode('child-2', 'root');
    dag.addNode('grandchild-1', 'child-1');

    const rootDescendants = dag.getDescendantKeys('root');
    expect(rootDescendants.has('child-1')).toBe(true);
    expect(rootDescendants.has('child-2')).toBe(true);
    expect(rootDescendants.has('grandchild-1')).toBe(true);
    expect(rootDescendants.size).toBe(3);

    const child1Descendants = dag.getDescendantKeys('child-1');
    expect(child1Descendants.has('grandchild-1')).toBe(true);
    expect(child1Descendants.size).toBe(1);
  });

  it('History Manager deduplicates identical consecutive snapshots', () => {
    const store = createPopoverStore(async (key) => ({ key }));
    const historyManager = createHistoryManager(10);

    // Initial push
    historyManager.pushSnapshot(store.getState());
    expect(historyManager.undoStack).toHaveLength(1);

    // Immediate second push without state mutation should be deduplicated
    historyManager.pushSnapshot(store.getState());
    expect(historyManager.undoStack).toHaveLength(1);
  });

  it('creates popover store and validates initial DAG state', () => {
    const store = createPopoverStore(async (key) => ({ id: key }));
    const state = store.getState();

    expect(state.trail).toHaveLength(0);
    expect(state.floating).toHaveLength(0);
    expect(state.zIndexOrder).toHaveLength(0);
  });
});
