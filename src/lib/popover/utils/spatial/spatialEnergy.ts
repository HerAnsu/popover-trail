/**
 * Spatial cascade overlap energy functional and placement optimization.
 * Implements AGREEMENT 8 (Spatial Partitioning & Viewport Clamping Geometry).
 *
 * @module utils/spatial/spatialEnergy
 */

import type { BoundingBox } from '../guards/spatialGuards';
import { sharedBoxPool } from '../pool/spatialPools';
import { intersectionArea } from './spatialAABB';
import { distanceSquared2D } from './spatialVector';
import { first } from '../arrayUtils';

export interface Point2D {
  /** Horizontal X coordinate in pixels. */
  readonly x: number;
  /** Vertical Y coordinate in pixels. */
  readonly y: number;
}

export interface Size2D {
  /** Width dimension in pixels. */
  readonly width: number;
  /** Height dimension in pixels. */
  readonly height: number;
}

/**
 * Computes the total overlapping intersection area between a candidate bounding box and obstacles.
 *
 * @example
 * ```ts
 * const overlapArea = computeOverlapIntersectionArea(candidateBox, existingCards);
 * if (overlapArea === 0) {
 *   // Completely clear placement with zero collisions
 * }
 * ```
 *
 * @param card - Bounding box of the popover card.
 * @param obstacles - Array of obstacle bounding boxes to test against.
 * @returns Total intersection area in square pixels.
 */
export function computeOverlapIntersectionArea(
  card: BoundingBox,
  obstacles: readonly BoundingBox[],
): number {
  let total = 0;
  for (const obstacle of obstacles) {
    total += intersectionArea(card, obstacle);
  }
  return total;
}

/**
 * Computes the spatial cascade placement penalty ("energy") for a candidate position.
 *
 * @remarks
 * Uses an energy minimization model:
 * $$E(\vec{p}) = \text{OverlapArea}(\vec{p}) + \lambda \cdot \|\vec{p} - \vec{p}_{\text{preferred}}\|^2$$
 *
 * Where:
 * - **OverlapArea**: Total collision area with other popovers/obstacles (heavily penalized).
 * - **Distance penalty**: Quadratic Euclidean distance from preferred position (e.g. anchor trigger),
 *   scaled by the trade-off factor $\lambda$.
 *
 * Zero garbage collection: acquires scratch bounding boxes from `sharedBoxPool`.
 *
 * @example
 * ```ts
 * const energy = computeCascadeOverlapEnergy(
 *   { x: 200, y: 150 },
 *   { width: 300, height: 200 },
 *   existingCards,
 *   { x: 180, y: 150 },
 *   0.5,
 * );
 * ```
 *
 * @param position - Candidate top-left coordinate.
 * @param size - Dimensions of the popover card.
 * @param obstacles - Existing obstacle bounding boxes.
 * @param preferredPosition - Desired anchor coordinate.
 * @param lambda - Distance penalty multiplier (default 0.5).
 * @returns Evaluated placement energy score (lower is better).
 */
export function computeCascadeOverlapEnergy(
  position: Point2D,
  size: Size2D,
  obstacles: readonly BoundingBox[],
  preferredPosition: Point2D,
  lambda = 0.5,
): number {
  const cardBox = sharedBoxPool.acquire();
  try {
    cardBox.x = position.x;
    cardBox.y = position.y;
    cardBox.width = size.width;
    cardBox.height = size.height;
    const distSq = distanceSquared2D(position, preferredPosition);
    return computeOverlapIntersectionArea(cardBox, obstacles) + lambda * distSq;
  } finally {
    sharedBoxPool.release(cardBox);
  }
}

/**
 * Evaluates candidate positions and selects the one that minimizes overlap collisions and anchor distance.
 *
 * @remarks
 * Iterates through `candidates` and picks the position with the lowest computed energy score.
 *
 * @example
 * ```ts
 * const bestPlacement = selectLowestEnergyPlacement(
 *   [rightPlacement, leftPlacement, bottomPlacement],
 *   cardSize,
 *   obstacles,
 *   preferredTriggerPosition,
 * );
 * ```
 *
 * @param candidates - List of candidate coordinates (e.g. right-start, left-start, bottom-start).
 * @param size - Dimensions of the popover card.
 * @param obstacles - Existing obstacle bounding boxes.
 * @param preferredPosition - Desired ideal anchor coordinate.
 * @param lambda - Distance penalty multiplier (default 0.5).
 * @returns Best position coordinate, or `undefined` if candidates list is empty.
 */
export function selectLowestEnergyPlacement(
  candidates: readonly Point2D[],
  size: Size2D,
  obstacles: readonly BoundingBox[],
  preferredPosition: Point2D,
  lambda = 0.5,
): Point2D | undefined {
  if (candidates.length === 0) return undefined;
  let bestPos = first(candidates);
  let minEnergy = Infinity;

  const cardBox = sharedBoxPool.acquire();
  try {
    cardBox.width = size.width;
    cardBox.height = size.height;
    for (const pos of candidates) {
      cardBox.x = pos.x;
      cardBox.y = pos.y;
      const distSq = distanceSquared2D(pos, preferredPosition);
      const energy = computeOverlapIntersectionArea(cardBox, obstacles) + lambda * distSq;
      if (energy < minEnergy) {
        minEnergy = energy;
        bestPos = pos;
      }
    }
  } finally {
    sharedBoxPool.release(cardBox);
  }
  return bestPos;
}
