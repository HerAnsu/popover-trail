/**
 * Spatial Quadrant Subdivision Calculations.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialSubdivide
 */

import type { BoundingBox } from '../guards/spatialGuards';

/**
 * Four-way quadrant boundaries produced by subdividing a 2D bounding box.
 */
export interface QuadrantSubdivision {
  /** North-East (top-right) quadrant boundary. */
  readonly ne: BoundingBox;
  /** North-West (top-left) quadrant boundary. */
  readonly nw: BoundingBox;
  /** South-West (bottom-left) quadrant boundary. */
  readonly sw: BoundingBox;
  /** South-East (bottom-right) quadrant boundary. */
  readonly se: BoundingBox;
}

/**
 * Subdivides an axis-aligned bounding box into four equal sub-quadrants (NE, NW, SW, SE).
 *
 * @param bounds - Spatial boundary to divide into four quadrants.
 * @returns Quadrant boundaries for `ne`, `nw`, `sw`, and `se`.
 *
 * @example
 * ```typescript
 * const quadrants = subdivideBounds({ x: 0, y: 0, width: 100, height: 100 });
 * // quadrants.nw => { x: 0, y: 0, width: 50, height: 50 }
 * // quadrants.ne => { x: 50, y: 0, width: 50, height: 50 }
 * // quadrants.sw => { x: 0, y: 50, width: 50, height: 50 }
 * // quadrants.se => { x: 50, y: 50, width: 50, height: 50 }
 * ```
 */
export function subdivideBounds(bounds: BoundingBox): QuadrantSubdivision {
  const subWidth = bounds.width / 2;
  const subHeight = bounds.height / 2;
  const { x, y } = bounds;

  return {
    ne: { x: x + subWidth, y, width: subWidth, height: subHeight },
    nw: { x, y, width: subWidth, height: subHeight },
    sw: { x, y: y + subHeight, width: subWidth, height: subHeight },
    se: { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
  };
}
