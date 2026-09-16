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
  /** Target X coordinate if an obstacle edge is within snapping threshold, otherwise undefined. */
  readonly snapX?: number;
  /** Target Y coordinate if an obstacle edge is within snapping threshold, otherwise undefined. */
  readonly snapY?: number;
}

/**
 * Searches the QuadTree for the nearest indexed item to a target 2D point.
 *
 * @remarks
 * Recursively visits quadrants ordered by distance from the point to quadrant bounds,
 * pruning branches that cannot beat the current best distance.
 *
 * @example
 * ```ts
 * const nearest = findNearestQuadItem(quadTree, { x: 100, y: 200 }, 50);
 * if (nearest) {
 *   console.log('Closest popover:', nearest.id);
 * }
 * ```
 *
 * @param tree - Root or subtree QuadTree node.
 * @param point - Target 2D coordinates.
 * @param maxDistance - Maximum search radius in pixels (default Infinity).
 * @returns Nearest item or undefined if none within maxDistance.
 */
export function findNearestQuadItem<TId extends string = string>(
  tree: QuadTree<TId>,
  point: Point2D,
  maxDistance = Infinity,
): QuadItem<TId> | undefined {
  let bestItem: QuadItem<TId> | undefined = undefined;
  let bestDist = maxDistance;

  function search(node: QuadTree<TId>): void {
    // Prune this quadrant if even its closest boundary is farther than our current best match
    if (distanceToBox(point, node.bounds) >= bestDist) return;

    // Check items directly contained within this quadrant node
    for (const item of node.getItems()) {
      const d = distanceToBox(point, item.bounds);
      if (d < bestDist) {
        bestDist = d;
        bestItem = item;
      }
    }

    // Sort child quadrants by distance to point to search the most promising quadrants first
    const subNodes = [...node.getNodes()];
    subNodes.sort((a, b) => distanceToBox(point, a.bounds) - distanceToBox(point, b.bounds));

    for (const sub of subNodes) {
      search(sub);
    }
  }

  search(tree);
  return bestItem;
}

/**
 * Finds the nearest item in the QuadTree to a 2D coordinate point.
 * Alias for {@link findNearestQuadItem}.
 */
export const findNearestItem = findNearestQuadItem;

/**
 * Computes magnetic snapping coordinates for a moving bounding box against static obstacles.
 *
 * @remarks
 * Tests four candidate snapping alignments along each axis:
 * - **Horizontal (X)**:
 *   1. Card's left edge snaps to obstacle's right edge (`obstacle.x + obstacle.width`)
 *   2. Card's right edge snaps to obstacle's left edge (`obstacle.x - card.width`)
 *   3. Card's left edge aligns with obstacle's left edge (`obstacle.x`)
 *   4. Card's right edge aligns with obstacle's right edge (`obstacle.x + obstacle.width - card.width`)
 * - **Vertical (Y)**:
 *   1. Card's top edge snaps to obstacle's bottom edge (`obstacle.y + obstacle.height`)
 *   2. Card's bottom edge snaps to obstacle's top edge (`obstacle.y - card.height`)
 *   3. Card's top edge aligns with obstacle's top edge (`obstacle.y`)
 *   4. Card's bottom edge aligns with obstacle's bottom edge (`obstacle.y + obstacle.height - card.height`)
 *
 * The closest candidate within the `threshold` distance wins.
 *
 * @example
 * ```ts
 * const snap = findMagneticSnap(draggedCardBounds, existingCards, 12);
 * const nextX = snap.snapX ?? draggedCardBounds.x;
 * const nextY = snap.snapY ?? draggedCardBounds.y;
 * ```
 *
 * @param bounds - Current bounding box of the card being dragged.
 * @param obstacles - Bounding boxes of existing cards or UI obstacles.
 * @param threshold - Maximum snapping distance in pixels (default 12px).
 * @returns Snapped X and Y coordinates (or undefined if outside threshold).
 */
export function findMagneticSnap(
  bounds: BoundingBox,
  obstacles: readonly BoundingBox[],
  threshold = 12,
): SnapResult {
  let snapX: number | undefined = undefined;
  let snapY: number | undefined = undefined;
  let minDx = threshold;
  let minDy = threshold;

  for (const obstacle of obstacles) {
    if (!obstacle) continue;
    const obstacleWidth = obstacle.width;
    const obstacleHeight = obstacle.height;
    const cardWidth = bounds.width;
    const cardHeight = bounds.height;

    // --- Candidate X positions ---
    // 1. Left edge of card touches right edge of obstacle
    const snapToObstacleRight = obstacle.x + obstacleWidth;
    // 2. Right edge of card touches left edge of obstacle
    const snapToObstacleLeft = obstacle.x - cardWidth;
    // 3. Left edge of card aligns with left edge of obstacle
    const alignWithObstacleLeft = obstacle.x;
    // 4. Right edge of card aligns with right edge of obstacle
    const alignWithObstacleRight = obstacle.x + obstacleWidth - cardWidth;

    if (Math.abs(bounds.x - snapToObstacleRight) < minDx) {
      minDx = Math.abs(bounds.x - snapToObstacleRight);
      snapX = snapToObstacleRight;
    }
    if (Math.abs(bounds.x - snapToObstacleLeft) < minDx) {
      minDx = Math.abs(bounds.x - snapToObstacleLeft);
      snapX = snapToObstacleLeft;
    }
    if (Math.abs(bounds.x - alignWithObstacleLeft) < minDx) {
      minDx = Math.abs(bounds.x - alignWithObstacleLeft);
      snapX = alignWithObstacleLeft;
    }
    if (Math.abs(bounds.x - alignWithObstacleRight) < minDx) {
      minDx = Math.abs(bounds.x - alignWithObstacleRight);
      snapX = alignWithObstacleRight;
    }

    // --- Candidate Y positions ---
    // 1. Top edge of card touches bottom edge of obstacle
    const snapToObstacleBottom = obstacle.y + obstacleHeight;
    // 2. Bottom edge of card touches top edge of obstacle
    const snapToObstacleTop = obstacle.y - cardHeight;
    // 3. Top edge of card aligns with top edge of obstacle
    const alignWithObstacleTop = obstacle.y;
    // 4. Bottom edge of card aligns with bottom edge of obstacle
    const alignWithObstacleBottom = obstacle.y + obstacleHeight - cardHeight;

    if (Math.abs(bounds.y - snapToObstacleBottom) < minDy) {
      minDy = Math.abs(bounds.y - snapToObstacleBottom);
      snapY = snapToObstacleBottom;
    }
    if (Math.abs(bounds.y - snapToObstacleTop) < minDy) {
      minDy = Math.abs(bounds.y - snapToObstacleTop);
      snapY = snapToObstacleTop;
    }
    if (Math.abs(bounds.y - alignWithObstacleTop) < minDy) {
      minDy = Math.abs(bounds.y - alignWithObstacleTop);
      snapY = alignWithObstacleTop;
    }
    if (Math.abs(bounds.y - alignWithObstacleBottom) < minDy) {
      minDy = Math.abs(bounds.y - alignWithObstacleBottom);
      snapY = alignWithObstacleBottom;
    }
  }

  return { snapX, snapY };
}
