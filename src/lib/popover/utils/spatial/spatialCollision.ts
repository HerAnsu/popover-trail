/**
 * Collision Detection and Predicate Queries for Spatial QuadTree.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialCollision
 */

import type { BoundingBox, QuadItem } from '../guards/spatialGuards';
import { borrowPooledSeen } from './spatialQueryPool';
import { visitQuadItems } from './spatialQuery';
import type { QuadTree } from './quadTreeCore';

/**
 * Tests whether any item within the given QuadTree nodes collides with the target bounding box.
 * Short-circuits immediately upon discovering the first collision.
 *
 * @template TId - Node identifier type.
 * @param nodes - Array of child QuadTree nodes to traverse.
 * @param items - Items stored at the current tree level.
 * @param bounds - Current node bounding box.
 * @param target - Target bounding box to test for collisions.
 * @param excludeId - Optional ID to ignore during collision checking (e.g. self-collision).
 * @returns `true` if an overlapping item exists; `false` otherwise.
 *
 * @example
 * ```ts
 * const collides = hasCollisionInNodes(nodes, items, bounds, targetBox, 'card-1');
 * ```
 */
export function hasCollisionInNodes<TId extends string>(
  nodes: readonly QuadTree<TId>[],
  items: readonly QuadItem<TId>[],
  bounds: BoundingBox,
  target: BoundingBox,
  excludeId?: TId,
): boolean {
  using seen = borrowPooledSeen();
  let found = false;
  visitQuadItems(
    nodes,
    items,
    bounds,
    target,
    (item) => {
      if (item.id !== excludeId) {
        found = true;
        return false;
      }
      return true;
    },
    seen,
  );
  return found;
}

/**
 * Searches QuadTree nodes for the first item intersecting the target bounding box that satisfies a predicate.
 * Short-circuits immediately once a match is found.
 *
 * @template TId - Node identifier type.
 * @param nodes - Array of child QuadTree nodes to traverse.
 * @param items - Items stored at the current tree level.
 * @param bounds - Current node bounding box.
 * @param target - Target bounding box to test for intersection.
 * @param predicate - Optional filter function to evaluate matched items.
 * @returns The first matching `QuadItem` or `undefined` if none found.
 *
 * @example
 * ```ts
 * const obstacle = findFirstInNodes(nodes, items, bounds, targetBox, (it) => it.id.startsWith('pinned-'));
 * ```
 */
export function findFirstInNodes<TId extends string>(
  nodes: readonly QuadTree<TId>[],
  items: readonly QuadItem<TId>[],
  bounds: BoundingBox,
  target: BoundingBox,
  predicate?: (item: QuadItem<TId>) => boolean,
): QuadItem<TId> | undefined {
  using seen = borrowPooledSeen();
  let match: QuadItem<TId> | undefined;
  visitQuadItems(
    nodes,
    items,
    bounds,
    target,
    (item) => {
      if (!predicate || predicate(item)) {
        match = item;
        return false;
      }
      return true;
    },
    seen,
  );
  return match;
}
