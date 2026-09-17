/**
 * Spatial Boundary Validation and Quadrant Indexing.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialBounds
 */

import type { BoundingBox } from '../guards/spatialGuards';
import { toFiniteOrDefault, isNonNegativeFinite } from '../guards/numberGuards';

/**
 * Sanitizes and normalizes an input bounding box to guarantee finite numeric dimensions.
 *
 * @remarks
 * Replaces non-finite values (`NaN`, `Infinity`, `-Infinity`) with 0, and guarantees
 * width and height are non-negative.
 *
 * @param bounds - Raw or optional input bounding box.
 * @returns Sanitized `BoundingBox` with safe finite numbers.
 *
 * @example
 * ```typescript
 * const clean = sanitizeSpatialBounds({ x: NaN, y: 10, width: -5, height: 100 });
 * // => { x: 0, y: 10, width: 0, height: 100 }
 * ```
 */
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

/**
 * Discrete quadrant index for 2D QuadTree spatial partitioning:
 * - `0`: North-East (top-right)
 * - `1`: North-West (top-left)
 * - `2`: South-West (bottom-left)
 * - `3`: South-East (bottom-right)
 */
export type QuadrantIndex = 0 | 1 | 2 | 3;

/**
 * Result of quadrant containment check: either a valid quadrant index `0..3` or `-1` (None).
 */
export type SpatialQuadrant = QuadrantIndex | -1;

/**
 * Enumeration mapping for QuadTree sub-node spatial quadrants.
 */
export const Quadrant = {
  /** North-East: $[x_{\text{mid}}, x_{\max}] \times [y_{\min}, y_{\text{mid}}]$ */
  NE: 0,
  /** North-West: $[x_{\min}, x_{\text{mid}}] \times [y_{\min}, y_{\text{mid}}]$ */
  NW: 1,
  /** South-West: $[x_{\min}, x_{\text{mid}}] \times [y_{\text{mid}}, y_{\max}]$ */
  SW: 2,
  /** South-East: $[x_{\text{mid}}, x_{\max}] \times [y_{\text{mid}}, y_{\max}]$ */
  SE: 3,
  /** Spans across quadrant division boundaries; cannot be placed strictly within a child node. */
  None: -1,
} as const;

/**
 * Determines which child quadrant entirely encloses the given bounding box within its parent bounds.
 *
 * @remarks
 * If the bounding box straddles horizontal or vertical midpoints ($vMid$ or $hMid$), it cannot
 * fit completely inside any single sub-quadrant and must remain in the current parent QuadTree node.
 * In this case, `Quadrant.None` (`-1`) is returned.
 *
 * ```
 *        North (top)
 *   NW (1)   |   NE (0)
 * -----------+-----------
 *   SW (2)   |   SE (3)
 *        South (bottom)
 * ```
 *
 * @param bounds - Target rectangle to evaluate.
 * @param parentBounds - Enclosing quadrant boundary of the parent node.
 * @returns Matching `QuadrantIndex` (0..3) if completely contained, or `Quadrant.None` (-1) if straddling.
 *
 * @example
 * ```typescript
 * const quadrant = getQuadrantIndex(
 *   { x: 10, y: 10, width: 20, height: 20 },
 *   { x: 0, y: 0, width: 100, height: 100 }
 * );
 * // => Quadrant.NW (1)
 * ```
 */
export function getQuadrantIndex(bounds: BoundingBox, parentBounds: BoundingBox): SpatialQuadrant {
  const vMid = parentBounds.x + parentBounds.width / 2;
  const hMid = parentBounds.y + parentBounds.height / 2;

  // Verify vertical containment
  const fitsTop = bounds.y + bounds.height <= hMid;
  const fitsBottom = bounds.y >= hMid;

  // Verify horizontal containment
  const fitsLeft = bounds.x + bounds.width <= vMid;
  const fitsRight = bounds.x >= vMid;

  // Assign quadrant if fully enclosed on one side of each dividing line
  if (fitsLeft) {
    if (fitsTop) return Quadrant.NW;
    if (fitsBottom) return Quadrant.SW;
  } else if (fitsRight) {
    if (fitsTop) return Quadrant.NE;
    if (fitsBottom) return Quadrant.SE;
  }
  // Straddles either the vertical or horizontal boundary line
  return Quadrant.None;
}
