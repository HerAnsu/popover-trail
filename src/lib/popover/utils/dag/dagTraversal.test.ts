import { describe, it, expect } from 'vitest';
import { PopoverDAG } from './dagCore';
import {
  visitDescendants,
  collectAncestors,
  collectDescendants,
  getBreadcrumbs,
} from './dagTraversal';
import type { InternalDAGNode } from './dagTypes';

describe('dagTraversal algorithms', () => {
  it('early aborts visitDescendants when visitor returns false', () => {
    const dag = new PopoverDAG();
    dag.addNode('A');
    dag.addNode('B', 'A');
    dag.addNode('C', 'B');
    dag.addNode('D', 'C');

    const visited: string[] = [];
    const internalNodes = (dag as unknown as { nodes: Map<string, InternalDAGNode<string>> }).nodes;

    const completed = visitDescendants(internalNodes, 'A', (key) => {
      visited.push(key);
      if (key === 'B') return false;
      return true;
    });

    expect(completed).toBe(false);
    expect(visited).toContain('B');
    expect(visited).not.toContain('D');
  });

  it('collects all reachable descendants via collectDescendants', () => {
    const dag = new PopoverDAG();
    dag.addNode('root');
    dag.addNode('child1', 'root');
    dag.addNode('child2', 'root');
    dag.addNode('grandchild', 'child1');

    const internalNodes = (dag as unknown as { nodes: Map<string, InternalDAGNode<string>> }).nodes;
    const descendants = collectDescendants(internalNodes, 'root', new Set<string>());
    expect(descendants.size).toBe(3);
    expect(descendants.has('child1')).toBe(true);
    expect(descendants.has('child2')).toBe(true);
    expect(descendants.has('grandchild')).toBe(true);
  });

  it('traverses all multi-parent ancestors via collectAncestors', () => {
    const dag = new PopoverDAG();
    dag.addEdge('RootA', 'Mid1');
    dag.addEdge('RootB', 'Mid2');
    dag.addEdge('Mid1', 'Target');
    dag.addEdge('Mid2', 'Target');

    const internalNodes = (dag as unknown as { nodes: Map<string, InternalDAGNode<string>> }).nodes;
    const directAncestors = collectAncestors(internalNodes, 'Target');
    expect(directAncestors.size).toBe(4);

    const ancestors = dag.getAncestors('Target');
    expect(ancestors.has('Mid1')).toBe(true);
    expect(ancestors.has('Mid2')).toBe(true);
    expect(ancestors.has('RootA')).toBe(true);
    expect(ancestors.has('RootB')).toBe(true);
    expect(ancestors.size).toBe(4);
  });

  it('computes breadcrumbs path from root to leaf', () => {
    const dag = new PopoverDAG();
    dag.addNode('root');
    dag.addNode('step1', 'root');
    dag.addNode('step2', 'step1');

    const internalNodes = (dag as unknown as { nodes: Map<string, InternalDAGNode<string>> }).nodes;
    expect(getBreadcrumbs(internalNodes, 'step2')).toEqual(['root', 'step1', 'step2']);

    const path = dag.getBreadcrumbs('step2');
    expect(path).toEqual(['root', 'step1', 'step2']);
  });

  it('returns empty array for non-existent node in breadcrumbs path', () => {
    const dag = new PopoverDAG();
    expect(dag.getBreadcrumbs('unknown')).toEqual([]);
  });
});
