/**
 * Connected Component Spatial Clustering for Popover Hierarchies.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialClusters
 */

import type { BoundingBox, QuadItem } from '../guards/spatialGuards';
import { boundingUnion } from './spatialAABB';
import { QuadTree } from './quadTreeCore';
import { RingBuffer } from '../buffer';

export interface SpatialCluster<TId extends string = string> {
  readonly bounds: BoundingBox;
  readonly items: readonly QuadItem<TId>[];
}

function computeEnclosingBounds<TId extends string>(items: readonly QuadItem<TId>[]): BoundingBox {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const it of items) {
    minX = Math.min(minX, it.bounds.x);
    maxX = Math.max(maxX, it.bounds.x + it.bounds.width);
    minY = Math.min(minY, it.bounds.y);
    maxY = Math.max(maxY, it.bounds.y + it.bounds.height);
  }

  const w = maxX > minX ? maxX - minX : 1;
  const h = maxY > minY ? maxY - minY : 1;
  return { x: minX - 10, y: minY - 10, width: w + 20, height: h + 20 };
}

export function findSpatialClusters<TId extends string>(
  items: readonly QuadItem<TId>[],
): SpatialCluster<TId>[] {
  if (items.length === 0) return [];

  const tree = new QuadTree<TId>(computeEnclosingBounds(items));
  for (const item of items) tree.insert(item);

  const clusters: SpatialCluster<TId>[] = [];
  const visited = new Set<TId>();

  for (const seed of items) {
    if (visited.has(seed.id)) continue;

    visited.add(seed.id);
    const clusterItems: QuadItem<TId>[] = [seed];
    let clusterBounds = seed.bounds;
    const queue = new RingBuffer<QuadItem<TId>>({
      capacity: Math.max(16, items.length),
      autoExpand: true,
    });
    queue.push(seed);

    while (!queue.isEmpty) {
      const current = queue.shift();
      if (!current) break;

      const neighbors = tree.retrieve([], current.bounds);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);
          clusterItems.push(neighbor);
          queue.push(neighbor);
          clusterBounds = boundingUnion(clusterBounds, neighbor.bounds);
        }
      }
    }

    clusters.push({ bounds: clusterBounds, items: clusterItems });
  }

  return clusters;
}
