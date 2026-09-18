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
 * @param card - Bounding box of the popover card.
 * @param obstacles - Array of obstacle bounding boxes to test against.
 * @returns Total intersection area in square pixels.
 *
 * @example
 * ```typescript
 * const overlap = totalOverlapArea(candidateBox, existingCards);
 * if (overlap === 0) {
 *   // Clear placement with zero collisions
 * }
 * ```
 */
export function totalOverlapArea(
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
 * Evaluates placement quality using a combined penalty score:
 * `EnergyScore = OverlapArea + (lambda * distanceSquared)`
 *
 * Where:
 * - **OverlapArea**: Total pixel intersection area with other popovers (heavily penalized).
 * - **Distance penalty**: Squared distance from the preferred anchor position, scaled by `lambda`.
 *
 * Uses `sharedBoxPool` to avoid temporary heap allocations in animation loops.
 *
 * @param position - Candidate top-left coordinate.
 * @param size - Dimensions of the popover card.
 * @param obstacles - Existing obstacle bounding boxes.
 * @param preferredPosition - Desired anchor coordinate.
 * @param lambda - Distance penalty multiplier (default 0.5).
 * @returns Evaluated placement energy score (lower is better).
 *
 * @example
 * ```typescript
 * const score = cascadePlacementEnergy(
 *   { x: 200, y: 150 },
 *   { width: 300, height: 200 },
 *   existingCards,
 *   { x: 180, y: 150 },
 * );
 * ```
 */
export function cascadePlacementEnergy(
  position: Point2D,
  size: Size2D,
  obstacles: readonly BoundingBox[],
  preferredPosition: Point2D,
  lambda = 0.5,
): number {
  const { x, y } = position;
  const { width, height } = size;
  using cardBox = sharedBoxPool.borrowWith((b) => {
    b.x = x;
    b.y = y;
    b.width = width;
    b.height = height;
  });
  const distSq = distanceSquared2D(position, preferredPosition);
  return totalOverlapArea(cardBox, obstacles) + lambda * distSq;
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

  const { width, height } = size;
  using cardBox = sharedBoxPool.borrowWith((b) => {
    b.width = width;
    b.height = height;
  });
  for (const pos of candidates) {
    cardBox.x = pos.x;
    cardBox.y = pos.y;
    const distSq = distanceSquared2D(pos, preferredPosition);
    const energy = totalOverlapArea(cardBox, obstacles) + lambda * distSq;
    if (energy < minEnergy) {
      minEnergy = energy;
      bestPos = pos;
    }
  }
  return bestPos;
}
