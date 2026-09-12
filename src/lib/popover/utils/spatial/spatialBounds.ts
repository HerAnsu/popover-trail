/**
 * Spatial Boundary Validation and Quadrant Indexing.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialBounds
 */

import type { BoundingBox } from '../guards/spatialGuards';
import { toFiniteOrDefault, isNonNegativeFinite } from '../guards/numberGuards';

export function sanitizeSpatialBounds(bounds?: BoundingBox): BoundingBox {
  const w = bounds?.width;
  const h = bounds?.height;
  return {
    x: toFiniteOrDefault(bounds?.x, 0),
    y: toFiniteOrDefault(bounds?.y, 0),
    width: typeof w === 'number' && isNonNegativeFinite(w) ? w : 0,
    height: typeof h === 'number' && isNonNegativeFinite(h) ? h : 0,
  };
}

export function getQuadrantIndex(bounds: BoundingBox, parentBounds: BoundingBox): number {
  const vMid = parentBounds.x + parentBounds.width / 2;
  const hMid = parentBounds.y + parentBounds.height / 2;

  const fitsTop = bounds.y + bounds.height <= hMid;
  const fitsBottom = bounds.y >= hMid;
  const fitsLeft = bounds.x + bounds.width <= vMid;
  const fitsRight = bounds.x >= vMid;

  if (fitsLeft) {
    if (fitsTop) return 1; // NW
    if (fitsBottom) return 2; // SW
  } else if (fitsRight) {
    if (fitsTop) return 0; // NE
    if (fitsBottom) return 3; // SE
  }
  return -1;
}
