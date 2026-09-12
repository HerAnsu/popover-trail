/**
 * Spatial Bounding Box Queries and Intersection Lookups.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialQuery
 */

import { type BoundingBox, type QuadItem, boxesIntersect } from '../guards/spatialGuards';
import { getQuadrantIndex } from './spatialBounds';
import type { QuadTree } from './quadTreeCore';

export function visitQuadTreeItems<TId extends string>(
  nodes: readonly QuadTree<TId>[],
  items: readonly QuadItem<TId>[],
  parentBounds: BoundingBox,
  target: BoundingBox,
  visitor: (item: QuadItem<TId>) => boolean | void,
  seen: Set<string>,
): boolean {
  if (nodes.length > 0) {
    const idx = getQuadrantIndex(target, parentBounds);
    if (idx !== -1 && nodes[idx]) {
      if (nodes[idx].visit(target, visitor, seen) === false) return false;
    } else {
      for (const node of nodes) {
        if (boxesIntersect(node.bounds, target) && node.visit(target, visitor, seen) === false) {
          return false;
        }
      }
    }
  }

  for (const item of items) {
    if (item?.id && !seen.has(item.id) && boxesIntersect(item.bounds, target)) {
      seen.add(item.id);
      if (visitor(item) === false) return false;
    }
  }
  return true;
}

export function queryQuadTreeItems<TId extends string>(
  nodes: readonly QuadTree<TId>[],
  items: readonly QuadItem<TId>[],
  parentBounds: BoundingBox,
  target: BoundingBox,
  returnItems: QuadItem<TId>[],
  seen: Set<string>,
): void {
  visitQuadTreeItems(
    nodes,
    items,
    parentBounds,
    target,
    (item) => {
      returnItems.push(item);
    },
    seen,
  );
}
export { hasCollisionInNodes, findFirstInNodes } from './spatialCollision';
