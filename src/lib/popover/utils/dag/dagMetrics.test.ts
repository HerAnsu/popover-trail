import { describe, it, expect } from 'vitest';
import { PopoverDAG } from './dagCore';
import { findRoots, findLeaves, computeMaxDepth, isDescendantOf } from './dagMetrics';
import type { InternalDAGNode } from './dagTypes';

describe('dagMetrics algorithms', () => {
  it('finds roots, leaves, and computes max depth in multi-parent DAG', () => {
    const dag = new PopoverDAG();
    dag.addEdge('root1', 'mid');
    dag.addEdge('root2', 'mid');
    dag.addEdge('mid', 'leaf1');
    dag.addEdge('mid', 'leaf2');

    const internalNodes = (dag as unknown as { nodes: Map<string, InternalDAGNode<string>> }).nodes;

    const roots = findRoots(internalNodes);
    expect(roots).toContain('root1');
    expect(roots).toContain('root2');
    expect(roots).toHaveLength(2);

    const leaves = findLeaves(internalNodes);
    expect(leaves).toContain('leaf1');
    expect(leaves).toContain('leaf2');
    expect(leaves).toHaveLength(2);

    const maxDepth = computeMaxDepth(internalNodes);
    expect(maxDepth).toBe(2);
  });

  it('correctly queries isDescendantOf across multiple branching paths', () => {
    const dag = new PopoverDAG();
    dag.addEdge('p1', 'j');
    dag.addEdge('p2', 'j');
    dag.addEdge('j', 'c');

    const internalNodes = (dag as unknown as { nodes: Map<string, InternalDAGNode<string>> }).nodes;

    expect(isDescendantOf(internalNodes, 'c', 'p1')).toBe(true);
    expect(isDescendantOf(internalNodes, 'c', 'p2')).toBe(true);
    expect(isDescendantOf(internalNodes, 'j', 'p1')).toBe(true);
    expect(isDescendantOf(internalNodes, 'p1', 'c')).toBe(false);
    expect(isDescendantOf(internalNodes, 'p1', 'p1')).toBe(false);
    expect(isDescendantOf(internalNodes, 'c', 'nonExistent')).toBe(false);
  });
});
