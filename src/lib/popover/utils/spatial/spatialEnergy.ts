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
  readonly x: number;
  readonly y: number;
}

export interface Size2D {
  readonly width: number;
  readonly height: number;
}

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
