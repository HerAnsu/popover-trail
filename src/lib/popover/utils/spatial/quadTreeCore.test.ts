import { describe, it, expect } from 'vitest';
import { QuadTree } from './quadTreeCore';
import { DISPOSE_SYMBOL } from '../disposable';

describe('QuadTree core functionality', () => {
  it('initializes with sanitized bounds and capacity limits', () => {
    const tree = new QuadTree({ x: -10, y: -20, width: 100, height: 200 }, 4, 3);
    expect(tree.bounds).toEqual({ x: -10, y: -20, width: 100, height: 200 });
    expect(tree.maxItemsCapacity).toBe(4);
    expect(tree.maxLevelsLimit).toBe(3);
    expect(tree.size).toBe(0);
    expect(tree.getNodes()).toHaveLength(0);

    const fallback = new QuadTree({ x: 0, y: 0, width: 50, height: 50 }, -5, 0, -1);
    expect(fallback.maxItemsCapacity).toBe(16);
    expect(fallback.maxLevelsLimit).toBe(8);
  });

  it('allocates quadrants and splits boundaries when capacity is exceeded', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }, 2, 4);

    tree.insert({ id: 'nw-1', bounds: { x: 5, y: 5, width: 10, height: 10 } });
    tree.insert({ id: 'ne-1', bounds: { x: 55, y: 5, width: 10, height: 10 } });
    expect(tree.getNodes()).toHaveLength(0);
    expect(tree.getItems()).toHaveLength(2);

    tree.insert({ id: 'sw-1', bounds: { x: 5, y: 55, width: 10, height: 10 } });
    const nodes = tree.getNodes();
    expect(nodes).toHaveLength(4);

    const ne = nodes[0];
    const nw = nodes[1];
    const sw = nodes[2];
    const se = nodes[3];
    expect(ne?.bounds).toEqual({ x: 50, y: 0, width: 50, height: 50 });
    expect(nw?.bounds).toEqual({ x: 0, y: 0, width: 50, height: 50 });
    expect(sw?.bounds).toEqual({ x: 0, y: 50, width: 50, height: 50 });
    expect(se?.bounds).toEqual({ x: 50, y: 50, width: 50, height: 50 });

    expect(tree.size).toBe(3);
  });

  it('respects maxLevels limit to avoid unbounded partitioning', () => {
    // maxLevels = 1 allows root (level 0) to split once, but level 1 children cannot split
    const shallowTree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }, 2, 1);
    for (let i = 0; i < 10; i += 1) {
      shallowTree.insert({ id: `nw-${i}`, bounds: { x: 5, y: 5, width: 2, height: 2 } });
    }
    expect(shallowTree.getNodes()).toHaveLength(4);
    const nwChild = shallowTree.getNodes()[1];
    expect(nwChild?.getNodes()).toHaveLength(0);
    expect(shallowTree.size).toBe(10);
  });

  it('coalesces child nodes when items are removed below capacity', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 100, height: 100 }, 2, 3);
    tree.insert({ id: 'a', bounds: { x: 5, y: 5, width: 10, height: 10 } });
    tree.insert({ id: 'b', bounds: { x: 55, y: 5, width: 10, height: 10 } });
    tree.insert({ id: 'c', bounds: { x: 5, y: 55, width: 10, height: 10 } });

    expect(tree.getNodes()).toHaveLength(4);
    expect(tree.remove('c')).toBe(true);
    expect(tree.remove('non-existent')).toBe(false);

    expect(tree.getNodes()).toHaveLength(0);
    expect(tree.size).toBe(2);
  });

  it('handles update, clear, and disposal lifecycles', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 200, height: 200 }, 2, 3);
    tree.insert({ id: 'n1', bounds: { x: 10, y: 10, width: 20, height: 20 } });
    tree.insert({ id: 'n2', bounds: { x: 110, y: 110, width: 20, height: 20 } });

    expect(tree.update('n1', { x: 150, y: 150, width: 20, height: 20 })).toBe(true);
    expect(tree.update('missing', { x: 0, y: 0, width: 10, height: 10 })).toBe(false);

    expect(tree.hasCollision({ x: 155, y: 155, width: 5, height: 5 })).toBe(true);
    expect(tree.hasCollision({ x: 10, y: 10, width: 5, height: 5 })).toBe(false);

    const disposeFn = tree[DISPOSE_SYMBOL];
    if (typeof disposeFn === 'function') {
      disposeFn.call(tree);
    }
    expect(tree.size).toBe(0);
    expect(tree.getItems()).toHaveLength(0);
    expect(tree.getNodes()).toHaveLength(0);
  });
});
