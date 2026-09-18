/**
 * Spatial Partitioning Index Serialization & Snapshot Restoration.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialSnapshot
 */

import type { BoundingBox, QuadItem } from '../guards/spatialGuards';
import { isArray } from '../guards/arrayGuards';
import { QuadTree } from './quadTreeCore';

/**
 * Serialized representation of a QuadTree spatial index.
 *
 * @template TId - Unique string identifier type for stored items.
 */
export interface SpatialSnapshot<TId extends string = string> {
  /** Spatial root boundary of the indexed region. */
  readonly bounds: BoundingBox;
  /** Maximum items per node before triggering subdivision. */
  readonly maxItems: number;
  /** Maximum recursion depth tier of the tree. */
  readonly maxLevels: number;
  /** All items stored across the entire tree hierarchy. */
  readonly items: readonly QuadItem<TId>[];
}

/**
 * Exports a QuadTree spatial index into an immutable serializable snapshot.
 *
 * @template TId - Unique string identifier type for stored items.
 * @param tree - QuadTree instance to export.
 * @returns Serializable snapshot containing root bounds, capacities, and all stored items.
 *
 * @example
 * ```typescript
 * const tree = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 });
 * tree.insert({ id: 'card-1', bounds: { x: 10, y: 10, width: 50, height: 50 } });
 *
 * const snapshot = exportSpatialSnapshot(tree);
 * console.log(snapshot.items.length); // 1
 * ```
 */
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

/**
 * Restores a QuadTree spatial index from a serialized snapshot.
 *
 * @remarks
 * Returns `null` if the snapshot is missing, malformed, or missing required bounds.
 *
 * @template TId - Unique string identifier type for stored items.
 * @param snapshot - The serialized snapshot to restore, or null/undefined.
 * @returns A fully restored `QuadTree` instance populated with snapshot items, or `null` if invalid.
 *
 * @example
 * ```typescript
 * const restored = importSpatialSnapshot(snapshot);
 * if (restored) {
 *   const hits = restored.retrieve([], searchArea);
 * }
 * ```
 */
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
