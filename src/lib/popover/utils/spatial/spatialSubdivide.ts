/**
 * Spatial Quadrant Subdivision Calculations.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialSubdivide
 */

import type { BoundingBox } from '../guards/spatialGuards';

export interface QuadrantSubdivision {
  readonly ne: BoundingBox;
  readonly nw: BoundingBox;
  readonly sw: BoundingBox;
  readonly se: BoundingBox;
}

export function subdivideQuadrantBounds(bounds: BoundingBox): QuadrantSubdivision {
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
