import { describe, it, expect } from 'vitest';
import { QuadTree } from './quadTreeCore';
import { canCoalesceQuadNodes, tryCoalesceQuadTree } from './spatialCoalesce';

describe('spatialCoalesce', () => {
  it('detects when nodes can and cannot be coalesced', () => {
    expect(canCoalesceQuadNodes([], 0, 4)).toBe(false);

    const tree = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 }, 2);
    tree.insert({ id: '1', bounds: { x: 10, y: 10, width: 10, height: 10 } });
    tree.insert({ id: '2', bounds: { x: 600, y: 10, width: 10, height: 10 } });
    tree.insert({ id: '3', bounds: { x: 10, y: 600, width: 10, height: 10 } });

    // After 3 inserts with maxItems=2, tree is split
    expect(tree.getNodes()).toHaveLength(4);

    // Can coalesce if maxItems was 4
    expect(canCoalesceQuadNodes(tree.getNodes(), tree.getItems().length, 4)).toBe(true);

    // Cannot coalesce if maxItems is 2 (total is 3)
    expect(canCoalesceQuadNodes(tree.getNodes(), tree.getItems().length, 2)).toBe(false);
  });

  it('merges child nodes back into parent and clears children on coalesce', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 }, 2);
    tree.insert({ id: 'a', bounds: { x: 10, y: 10, width: 10, height: 10 } });
    tree.insert({ id: 'b', bounds: { x: 600, y: 10, width: 10, height: 10 } });
    tree.insert({ id: 'c', bounds: { x: 10, y: 600, width: 10, height: 10 } });

    expect(tree.getNodes()).toHaveLength(4);

    const merged = tryCoalesceQuadTree(tree.getNodes() as QuadTree[], [...tree.getItems()], 4);
    expect(merged).not.toBeNull();
    expect(merged).toHaveLength(3);
    expect(tree.getNodes()).toHaveLength(0);
  });
});
