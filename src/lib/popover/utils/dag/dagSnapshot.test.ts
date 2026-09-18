import { describe, it, expect } from 'vitest';
import { PopoverDAG } from './dagCore';

describe('PopoverDAG Snapshot and Restoration', () => {
  it('exports and imports DAG preserving multi-parent edges and depth', () => {
    const original = new PopoverDAG();
    original.addEdge('root1', 'cardA');
    original.addEdge('root2', 'cardA');
    original.addEdge('cardA', 'cardB');

    const snapshot = original.exportSnapshot();
    expect(snapshot.nodes).toHaveLength(4);

    const restored = new PopoverDAG();
    const ok = restored.importSnapshot(snapshot);
    expect(ok).toBe(true);
    expect(restored.size).toBe(4);
    expect(restored.getParents('cardA').size).toBe(2);
    expect(restored.getChildren('cardA').has('cardB')).toBe(true);
  });

  it('handles invalid snapshots safely', () => {
    const dag = new PopoverDAG();
    expect(dag.importSnapshot(null as unknown as Parameters<typeof dag.importSnapshot>[0])).toBe(
      false,
    );
    expect(dag.importSnapshot({} as unknown as Parameters<typeof dag.importSnapshot>[0])).toBe(
      false,
    );
  });
});
