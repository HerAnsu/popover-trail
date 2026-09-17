/**
 * Spatial Bounding Box Queries and Intersection Lookups.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialQuery
 */

import { type BoundingBox, type QuadItem, boxesIntersect } from '../guards/spatialGuards';
import { getQuadrantIndex } from './spatialBounds';
import type { QuadTree } from './quadTreeCore';

/**
 * Traverses items in the QuadTree intersecting with the target bounding box, invoking a visitor callback.
 *
 * @remarks
 * Uses hierarchical bounding box pruning:
 * 1. If the target box fits entirely into a single sub-quadrant, execution recurses into that quadrant only.
 * 2. Otherwise, iterates child quadrants and visits any whose bounds intersect with the target box.
 * 3. Tests items stored directly in this node and calls `visitor` for those that intersect and have not been visited yet (`seen` Set).
 *
 * Traversal terminates early if `visitor` returns `false`.
 *
 * @param nodes - Child quadrant subtrees.
 * @param items - Items stored at this node level.
 * @param parentBounds - Boundary of this node.
 * @param target - Target query rectangle.
 * @param visitor - Callback receiving intersecting items. Return `false` to abort early.
 * @param seen - Mutable set tracking visited item IDs to prevent duplicates.
 * @returns `false` if aborted early, `true` otherwise.
 *
 * @example
 * ```typescript
 * visitQuadTreeItems(nodes, items, bounds, targetBox, (item) => {
 *   console.log('Intersects with:', item.id);
 * }, new Set());
 * ```
 */
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

/**
 * Collects all items in the QuadTree intersecting with the target bounding box into an array.
 *
 * @param nodes - Child quadrant subtrees.
 * @param items - Items stored at this node level.
 * @param parentBounds - Boundary of this node.
 * @param target - Target query rectangle.
 * @param returnItems - Array into which intersecting items are pushed.
 * @param seen - Mutable set tracking visited item IDs.
 *
 * @example
 * ```typescript
 * const results: QuadItem[] = [];
 * queryQuadTreeItems(nodes, items, bounds, targetBox, results, new Set());
 * ```
 */
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
