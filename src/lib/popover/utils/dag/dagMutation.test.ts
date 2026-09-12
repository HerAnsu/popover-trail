import { describe, it, expect } from 'vitest';
import { PopoverDAG } from './dagCore';

describe('dagMutation operations', () => {
  it('correctly handles edge disconnection and fallback primary parent', () => {
    const dag = new PopoverDAG();
    dag.addEdge('P1', 'Child');
    dag.addEdge('P2', 'Child');

    expect(dag.getNode('Child')?.parentKey).toBe('P1');

    dag.removeEdge('P1', 'Child');
    expect(dag.getParents('Child').has('P1')).toBe(false);
    expect(dag.getParents('Child').has('P2')).toBe(true);
    // Primary parent should fall back to remaining parent P2
    expect(dag.getNode('Child')?.parentKey).toBe('P2');
  });

  it('deletes nodes cleanly and cleans up references in parents and children', () => {
    const dag = new PopoverDAG();
    dag.addEdge('P1', 'Middle');
    dag.addEdge('Middle', 'C1');

    dag.removeNode('Middle');
    expect(dag.hasNode('Middle')).toBe(false);
    expect(dag.getChildren('P1').has('Middle')).toBe(false);
    expect(dag.getParents('C1').has('Middle')).toBe(false);
    expect(dag.getNode('C1')?.parentKey).toBeUndefined();
  });

  it('no-ops safely when removing non-existent node or edge', () => {
    const dag = new PopoverDAG();
    expect(() => dag.removeNode('missing')).not.toThrow();
    expect(() => dag.removeEdge('missing1', 'missing2')).not.toThrow();
  });
});
