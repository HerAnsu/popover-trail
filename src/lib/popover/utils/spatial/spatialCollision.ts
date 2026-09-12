/**
 * Collision Detection and Predicate Queries for Spatial QuadTree.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialCollision
 */

import type { BoundingBox, QuadItem } from '../guards/spatialGuards';
import { withPooledSeen } from './spatialQueryPool';
import { visitQuadTreeItems } from './spatialQuery';
import type { QuadTree } from './quadTreeCore';

export function hasCollisionInNodes<TId extends string>(
  nodes: readonly QuadTree<TId>[],
  items: readonly QuadItem<TId>[],
  bounds: BoundingBox,
  target: BoundingBox,
  excludeId?: TId,
): boolean {
  return withPooledSeen((seen) => {
    let found = false;
    visitQuadTreeItems(
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
  });
}

export function findFirstInNodes<TId extends string>(
  nodes: readonly QuadTree<TId>[],
  items: readonly QuadItem<TId>[],
  bounds: BoundingBox,
  target: BoundingBox,
  predicate?: (item: QuadItem<TId>) => boolean,
): QuadItem<TId> | undefined {
  return withPooledSeen((seen) => {
    let match: QuadItem<TId> | undefined;
    visitQuadTreeItems(
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
  });
}
