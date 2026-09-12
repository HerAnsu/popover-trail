/**
 * Spatial Nearest-Neighbor (k-NN) and Magnetic Snapping Alignment.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialKNN
 */

import type { BoundingBox, QuadItem } from '../guards/spatialGuards';
import type { Point2D } from './spatialEnergy';
import { distanceToBox } from './spatialAABB';
import type { QuadTree } from './quadTreeCore';

export interface SnapResult {
  readonly snapX?: number;
  readonly snapY?: number;
}

export function findNearestQuadItem<TId extends string = string>(
  tree: QuadTree<TId>,
  point: Point2D,
  maxDistance = Infinity,
): QuadItem<TId> | undefined {
  let bestItem: QuadItem<TId> | undefined = undefined;
  let bestDist = maxDistance;

  function search(node: QuadTree<TId>): void {
    if (distanceToBox(point, node.bounds) >= bestDist) return;

    for (const item of node.getItems()) {
      const d = distanceToBox(point, item.bounds);
      if (d < bestDist) {
        bestDist = d;
        bestItem = item;
      }
    }

    const subNodes = [...node.getNodes()];
    subNodes.sort((a, b) => distanceToBox(point, a.bounds) - distanceToBox(point, b.bounds));

    for (const sub of subNodes) {
      search(sub);
    }
  }

  search(tree);
  return bestItem;
}

export function findMagneticSnap(
  bounds: BoundingBox,
  obstacles: readonly BoundingBox[],
  threshold = 12,
): SnapResult {
  let snapX: number | undefined = undefined;
  let snapY: number | undefined = undefined;
  let minDx = threshold;
  let minDy = threshold;

  for (const o of obstacles) {
    if (!o) continue;
    const ow = o.width,
      oh = o.height,
      bw = bounds.width,
      bh = bounds.height;

    const cX0 = o.x + ow;
    const cX1 = o.x - bw;
    const cX2 = o.x;
    const cX3 = o.x + ow - bw;
    if (Math.abs(bounds.x - cX0) < minDx) {
      minDx = Math.abs(bounds.x - cX0);
      snapX = cX0;
    }
    if (Math.abs(bounds.x - cX1) < minDx) {
      minDx = Math.abs(bounds.x - cX1);
      snapX = cX1;
    }
    if (Math.abs(bounds.x - cX2) < minDx) {
      minDx = Math.abs(bounds.x - cX2);
      snapX = cX2;
    }
    if (Math.abs(bounds.x - cX3) < minDx) {
      minDx = Math.abs(bounds.x - cX3);
      snapX = cX3;
    }

    const cY0 = o.y + oh;
    const cY1 = o.y - bh;
    const cY2 = o.y;
    const cY3 = o.y + oh - bh;
    if (Math.abs(bounds.y - cY0) < minDy) {
      minDy = Math.abs(bounds.y - cY0);
      snapY = cY0;
    }
    if (Math.abs(bounds.y - cY1) < minDy) {
      minDy = Math.abs(bounds.y - cY1);
      snapY = cY1;
    }
    if (Math.abs(bounds.y - cY2) < minDy) {
      minDy = Math.abs(bounds.y - cY2);
      snapY = cY2;
    }
    if (Math.abs(bounds.y - cY3) < minDy) {
      minDy = Math.abs(bounds.y - cY3);
      snapY = cY3;
    }
  }

  return { snapX, snapY };
}
