/**
 * Spatial Partitioning Index Serialization & Snapshot Restoration.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialSnapshot
 */

import type { BoundingBox, QuadItem } from '../guards/spatialGuards';
import { isArray } from '../guards/arrayGuards';
import { QuadTree } from './quadTreeCore';

export interface SpatialSnapshot<TId extends string = string> {
  readonly bounds: BoundingBox;
  readonly maxItems: number;
  readonly maxLevels: number;
  readonly items: readonly QuadItem<TId>[];
}

export function exportSpatialSnapshot<TId extends string>(
  tree: QuadTree<TId>,
): SpatialSnapshot<TId> {
  const items = tree.retrieve([], tree.bounds);
  return {
    bounds: { ...tree.bounds },
    maxItems: tree.maxItemsCapacity,
    maxLevels: tree.maxLevelsLimit,
    items,
  };
}

export function importSpatialSnapshot<TId extends string>(
  snapshot: SpatialSnapshot<TId> | null | undefined,
): QuadTree<TId> | null {
  if (!snapshot || !snapshot.bounds || !isArray(snapshot.items)) {
    return null;
  }

  const tree = new QuadTree<TId>(snapshot.bounds, snapshot.maxItems, snapshot.maxLevels);

  for (const item of snapshot.items) {
    if (item && item.id && item.bounds) {
      tree.insert(item);
    }
  }

  return tree;
}
