import { describe, it, expect, vi } from 'vitest';
import { splitQuadNodes, insertQuadItem, removeQuadItem } from './spatialInsert';
import { QuadTree } from './quadTreeCore';
import type { QuadItem } from '../guards/spatialGuards';

describe('spatialInsert', () => {
  const rootBounds = { x: 0, y: 0, width: 200, height: 200 };

  it('splits quad tree nodes into four sub-quadrants with factory', () => {
    const factory = vi.fn(
      (b: typeof rootBounds, mi: number, ml: number, l: number) => new QuadTree(b, mi, ml, l),
    );
    const nodes = splitQuadNodes(rootBounds, 4, 3, 1, factory);

    expect(nodes).toHaveLength(4);
    expect(factory).toHaveBeenCalledTimes(4);

    const [ne, nw, sw, se] = nodes;
    expect(ne?.bounds).toEqual({ x: 100, y: 0, width: 100, height: 100 });
    expect(nw?.bounds).toEqual({ x: 0, y: 0, width: 100, height: 100 });
    expect(sw?.bounds).toEqual({ x: 0, y: 100, width: 100, height: 100 });
    expect(se?.bounds).toEqual({ x: 100, y: 100, width: 100, height: 100 });
  });

  it('rejects invalid or null items without altering items array', () => {
    const items: QuadItem<string>[] = [];
    const nodes: QuadTree<string>[] = [];
    const onSplit = vi.fn();

    expect(insertQuadItem(nodes, items, rootBounds, 2, 2, 0, null, onSplit)).toEqual([]);
    expect(insertQuadItem(nodes, items, rootBounds, 2, 2, 0, { id: 'bad' }, onSplit)).toEqual(
      [],
    );
    expect(onSplit).not.toHaveBeenCalled();
    expect(items).toHaveLength(0);
  });

  it('re-partitions items into child quadrants on split while retaining straddling items', () => {
    const nodes: QuadTree<string>[] = [];
    let items: QuadItem<string>[] = [];
    const onSplit = () => {
      const sub = splitQuadNodes(
        rootBounds,
        2,
        2,
        1,
        (b, mi, ml, l) => new QuadTree<string>(b, mi, ml, l),
      );
      nodes.push(...sub);
    };

    const nwItem = { id: 'nw', bounds: { x: 10, y: 10, width: 20, height: 20 } };
    const straddleItem = { id: 'straddle', bounds: { x: 90, y: 90, width: 40, height: 40 } };
    const seItem = { id: 'se', bounds: { x: 120, y: 120, width: 20, height: 20 } };

    items = insertQuadItem(nodes, items, rootBounds, 2, 2, 0, nwItem, onSplit);
    items = insertQuadItem(nodes, items, rootBounds, 2, 2, 0, straddleItem, onSplit);
    expect(nodes).toHaveLength(0);

    // 3rd item triggers split
    items = insertQuadItem(nodes, items, rootBounds, 2, 2, 0, seItem, onSplit);
    expect(nodes).toHaveLength(4);

    // straddling item remains in parent items; nw and se are in child quadrants
    expect(items).toEqual([straddleItem]);
    const nwNode = nodes[1];
    const seNode = nodes[3];
    expect(nwNode?.getItems()).toEqual([nwItem]);
    expect(seNode?.getItems()).toEqual([seItem]);
  });

  it('routes items directly into existing child quadrants if they fit', () => {
    const nodes = splitQuadNodes(
      rootBounds,
      2,
      2,
      1,
      (b, mi, ml, l) => new QuadTree<string>(b, mi, ml, l),
    );
    const items: QuadItem<string>[] = [];
    const itemInNE = { id: 'ne-direct', bounds: { x: 120, y: 10, width: 20, height: 20 } };

    const remaining = insertQuadItem(nodes, items, rootBounds, 2, 2, 0, itemInNE, vi.fn());
    expect(remaining).toHaveLength(0);
    const neNode = nodes[0];
    expect(neNode?.getItems()).toEqual([itemInNE]);
  });

  it('removes item from items list or recursively from child nodes', () => {
    const items: QuadItem<string>[] = [
      { id: 'parent-item', bounds: { x: 90, y: 90, width: 30, height: 30 } },
    ];
    const nodes = splitQuadNodes(
      rootBounds,
      2,
      2,
      1,
      (b, mi, ml, l) => new QuadTree<string>(b, mi, ml, l),
    );
    const childNode = nodes[1];
    if (childNode) {
      childNode.insert({ id: 'child-item', bounds: { x: 10, y: 10, width: 10, height: 10 } });
    }

    expect(removeQuadItem(nodes, items, '')).toBe(false);
    expect(removeQuadItem(nodes, items, 'unknown')).toBe(false);
    expect(removeQuadItem(nodes, items, 'parent-item')).toBe(true);
    expect(items).toHaveLength(0);

    expect(removeQuadItem(nodes, items, 'child-item')).toBe(true);
    expect(childNode?.size).toBe(0);
  });
});
