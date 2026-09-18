import { describe, it, expect, vi } from 'vitest';
import {
  visitQuadItems,
  queryQuadItems,
  hasCollisionInNodes,
  findFirstInNodes,
} from './spatialQuery';
import { QuadTree } from './quadTreeCore';
import type { QuadItem } from '../guards/spatialGuards';

describe('spatialQuery', () => {
  const rootBounds = { x: 0, y: 0, width: 200, height: 200 };

  function setupTreeWithChildren(): {
    tree: QuadTree<string>;
    neItem: QuadItem<string>;
    nwItem: QuadItem<string>;
    swItem: QuadItem<string>;
    seItem: QuadItem<string>;
    rootItem: QuadItem<string>;
  } {
    const tree = new QuadTree<string>(rootBounds, 2, 2);
    const neItem = { id: 'ne-1', bounds: { x: 120, y: 20, width: 30, height: 30 } };
    const nwItem = { id: 'nw-1', bounds: { x: 20, y: 20, width: 30, height: 30 } };
    const swItem = { id: 'sw-1', bounds: { x: 20, y: 120, width: 30, height: 30 } };
    const seItem = { id: 'se-1', bounds: { x: 120, y: 120, width: 30, height: 30 } };
    const rootItem = { id: 'center', bounds: { x: 90, y: 90, width: 20, height: 20 } };

    tree.insert(neItem);
    tree.insert(nwItem);
    tree.insert(swItem);
    tree.insert(seItem);
    tree.insert(rootItem);

    return { tree, neItem, nwItem, swItem, seItem, rootItem };
  }

  it('prunes non-overlapping quadrants when target fits within a single quadrant', () => {
    const { tree, nwItem } = setupTreeWithChildren();
    const seen = new Set<string>();
    const visited: string[] = [];

    // Target is strictly within NW quadrant
    const target = { x: 10, y: 10, width: 50, height: 50 };
    const completed = visitQuadItems(
      tree.getNodes(),
      tree.getItems(),
      rootBounds,
      target,
      (item) => {
        visited.push(item.id);
      },
      seen,
    );

    expect(completed).toBe(true);
    expect(visited).toEqual([nwItem.id]);
    expect(seen.has('ne-1')).toBe(false);
    expect(seen.has('sw-1')).toBe(false);
  });

  it('queries intersecting items across multiple quadrants when target straddles midpoint', () => {
    const { tree } = setupTreeWithChildren();
    const seen = new Set<string>();
    const results: QuadItem<string>[] = [];

    // Target spans horizontal midline between NW and SW
    const target = { x: 15, y: 30, width: 40, height: 110 };
    queryQuadItems(tree.getNodes(), tree.getItems(), rootBounds, target, results, seen);

    const ids = results.map((r) => r.id);
    expect(ids).toContain('nw-1');
    expect(ids).toContain('sw-1');
    expect(ids).not.toContain('ne-1');
    expect(ids).not.toContain('se-1');
  });

  it('halts tree traversal immediately when visitor returns false', () => {
    const { tree } = setupTreeWithChildren();
    const seen = new Set<string>();
    const visitor = vi.fn(() => false);

    const target = { x: 0, y: 0, width: 200, height: 200 };
    const completed = visitQuadItems(
      tree.getNodes(),
      tree.getItems(),
      rootBounds,
      target,
      visitor,
      seen,
    );

    expect(completed).toBe(false);
    expect(visitor).toHaveBeenCalledTimes(1);
  });

  it('deduplicates items using the seen set', () => {
    const { tree } = setupTreeWithChildren();
    const seen = new Set<string>(['nw-1']); // nw-1 pre-marked as seen
    const visited: string[] = [];

    const target = { x: 0, y: 0, width: 100, height: 100 };
    visitQuadItems(
      tree.getNodes(),
      tree.getItems(),
      rootBounds,
      target,
      (item) => {
        visited.push(item.id);
      },
      seen,
    );

    expect(visited).not.toContain('nw-1');
  });

  it('evaluates collision detection and first matching item via re-exports', () => {
    const { tree } = setupTreeWithChildren();

    const hit = hasCollisionInNodes(
      tree.getNodes(),
      tree.getItems(),
      rootBounds,
      { x: 125, y: 25, width: 10, height: 10 },
      'ne-1',
    );
    expect(hit).toBe(false); // excluded ne-1

    const found = findFirstInNodes(
      tree.getNodes(),
      tree.getItems(),
      rootBounds,
      { x: 100, y: 100, width: 50, height: 50 },
      (item) => item.id.startsWith('se'),
    );
    expect(found?.id).toBe('se-1');
  });
});
