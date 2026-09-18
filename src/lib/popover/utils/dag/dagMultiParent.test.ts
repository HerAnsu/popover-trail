import { describe, it, expect } from 'vitest';
import { PopoverDAG } from './dagCore';

describe('PopoverDAG Multi-Parent Capabilities', () => {
  it('supports multiple parents for a single node via addEdge', () => {
    const dag = new PopoverDAG();

    // Node C depends on both A and B (e.g. shared modal)
    expect(dag.addEdge('A', 'C')).toBe(true);
    expect(dag.addEdge('B', 'C')).toBe(true);

    const parents = dag.getParents('C');
    expect(parents.has('A')).toBe(true);
    expect(parents.has('B')).toBe(true);
    expect(parents.size).toBe(2);

    expect(dag.getChildren('A').has('C')).toBe(true);
    expect(dag.getChildren('B').has('C')).toBe(true);
  });

  it('prevents cycle creation across multiple incoming paths', () => {
    const dag = new PopoverDAG();
    dag.addEdge('root1', 'join');
    dag.addEdge('root2', 'join');
    dag.addEdge('join', 'child');

    // Trying to make root1 child of 'child' should be rejected
    expect(dag.wouldCreateCycle('root1', 'child')).toBe(true);
    expect(dag.addEdge('child', 'root1')).toBe(false);

    // Trying to make root2 child of 'child' should be rejected
    expect(dag.wouldCreateCycle('root2', 'child')).toBe(true);
    expect(dag.addEdge('child', 'root2')).toBe(false);
  });

  it('removes single edge without disconnecting other parents', () => {
    const dag = new PopoverDAG();
    dag.addEdge('p1', 'child');
    dag.addEdge('p2', 'child');

    dag.removeEdge('p1', 'child');
    expect(dag.getParents('child').has('p1')).toBe(false);
    expect(dag.getParents('child').has('p2')).toBe(true);
    expect(dag.getChildren('p1').has('child')).toBe(false);
  });
});
