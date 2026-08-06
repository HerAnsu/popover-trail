import { describe, it, expect } from 'vitest';
import { PopoverDAG } from './dag';

describe('PopoverDAG utility', () => {
  it('adds root nodes and child nodes with correct depth', () => {
    const dag = new PopoverDAG();
    dag.addNode('root');
    dag.addNode('child-1', 'root');
    dag.addNode('grandchild', 'child-1');

    const descendants = dag.getDescendantKeys('root');
    expect(descendants.has('child-1')).toBe(true);
    expect(descendants.has('grandchild')).toBe(true);
    expect(descendants.size).toBe(2);
  });

  it('computes topological z-index order starting from baseZIndex', () => {
    const dag = new PopoverDAG();
    dag.addNode('root-a');
    dag.addNode('child-a1', 'root-a');
    dag.addNode('root-b');

    const zIndexMap = dag.getTopologicalZIndexOrder(1000);
    expect(zIndexMap.get('root-a')).toBe(1000);
    expect(zIndexMap.get('child-a1')).toBe(1001);
    expect(zIndexMap.get('root-b')).toBe(1002);
  });

  it('handles orphan nodes in topological z-index calculation', () => {
    const dag = new PopoverDAG();
    dag.addNode('orphan', 'missing-parent');

    const zIndexMap = dag.getTopologicalZIndexOrder(500);
    expect(zIndexMap.has('orphan')).toBe(true);
    expect(zIndexMap.get('orphan')).toBe(500);
  });

  it('returns empty descendant set for unknown parent key', () => {
    const dag = new PopoverDAG();
    expect(dag.getDescendantKeys('non-existent').size).toBe(0);
  });

  it('clears all nodes', () => {
    const dag = new PopoverDAG();
    dag.addNode('a');
    dag.addNode('b', 'a');
    dag.clear();

    expect(dag.getDescendantKeys('a').size).toBe(0);
    expect(dag.getTopologicalZIndexOrder().size).toBe(0);
  });

  it('handles deep multi-level tree branching correctly', () => {
    const dag = new PopoverDAG();
    dag.addNode('root');
    dag.addNode('b1', 'root');
    dag.addNode('b2', 'root');
    dag.addNode('c1', 'b1');
    dag.addNode('c2', 'b1');
    dag.addNode('d1', 'c1');

    const rootDescendants = dag.getDescendantKeys('root');
    expect(rootDescendants.size).toBe(5);
    expect(Array.from(rootDescendants)).toEqual(['b1', 'b2', 'c1', 'c2', 'd1']);

    const b1Descendants = dag.getDescendantKeys('b1');
    expect(b1Descendants.size).toBe(3);
    expect(Array.from(b1Descendants)).toEqual(['c1', 'c2', 'd1']);
  });

  it('prevents infinite loops when cyclic parent-child links are introduced', () => {
    const dag = new PopoverDAG();
    dag.addNode('node-a');
    dag.addNode('node-b', 'node-a');
    dag.addNode('node-c', 'node-b');
    // Force a cycle: node-a child of node-c
    dag.addNode('node-a', 'node-c');

    const descendants = dag.getDescendantKeys('node-a');
    expect(descendants.has('node-b')).toBe(true);
    expect(descendants.has('node-c')).toBe(true);

    // Ensure topological z-index visit terminates
    const zIndexes = dag.getTopologicalZIndexOrder(100);
    expect(zIndexes.size).toBe(3);
  });
});
