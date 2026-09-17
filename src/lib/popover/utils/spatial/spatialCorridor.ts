/**
 * Pointer Safe Corridor and Safe Triangle Geometry.
 * Prevents premature nested popover teardown during diagonal pointer traversal.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialCorridor
 */

import type { BoundingBox } from '../guards/spatialGuards';
import { sharedPointPool } from '../pool/spatialPools';
import type { Point2D } from './spatialEnergy';

/**
 * Computes the 2D cross-product of vectors (p1 - p3) and (p2 - p3).
 *
 * @remarks
 * Used for half-plane orientation testing. If sign is positive, point lies on one side;
 * if negative, on the opposite side; if zero, the points are collinear.
 */
function sign(p1: Point2D, p2: Point2D, p3: Point2D): number {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

/**
 * Determines whether a 2D point lies inside or on the boundary of a triangle (a, b, c).
 *
 * @remarks
 * Uses the half-plane cross-product method. A point is inside the triangle if and only if
 * it lies on the same side of all three directed line segments (ab, bc, ca).
 *
 * @example
 * ```ts
 * const inside = isPointInTriangle(
 *   { x: 5, y: 5 },
 *   { x: 0, y: 0 },
 *   { x: 10, y: 0 },
 *   { x: 5, y: 10 },
 * ); // => true
 * ```
 *
 * @param p - 2D point to test.
 * @param a - First vertex of triangle.
 * @param b - Second vertex of triangle.
 * @param c - Third vertex of triangle.
 * @returns True if point is inside or on the perimeter of the triangle.
 */
export function isPointInTriangle(p: Point2D, a: Point2D, b: Point2D, c: Point2D): boolean {
  const d1 = sign(p, a, b);
  const d2 = sign(p, b, c);
  const d3 = sign(p, c, a);

  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

  return !(hasNeg && hasPos);
}

/**
 * Checks whether a 2D coordinate point lies within an axis-aligned bounding box.
 *
 * @example
 * ```ts
 * isPointInBox({ x: 15, y: 25 }, { x: 10, y: 20, width: 50, height: 50 }); // => true
 * ```
 *
 * @param p - Point coordinate.
 * @param box - Axis-aligned bounding box.
 * @returns True if point falls inside the box bounds.
 */
export function isPointInBox(p: Point2D, box: BoundingBox): boolean {
  return p.x >= box.x && p.x <= box.x + box.width && p.y >= box.y && p.y <= box.y + box.height;
}

/**
 * Evaluates whether the pointer cursor is moving through the safe triangle corridor
 * spanning between the trigger anchor origin and the target popover card.
 *
 * @remarks
 * Zero heap allocation: scratch points `pA` and `pB` are leased from `sharedPointPool`.
 * Selects the triangle base vertices from the target card edge closest to the anchor.
 *
 * @example
 * ```ts
 * const inTriangle = isCursorInSafeTriangle(
 *   { x: 120, y: 60 },
 *   { x: 50, y: 50 },
 *   { x: 150, y: 20, width: 200, height: 300 },
 * );
 * ```
 *
 * @param cursor - Current pointer coordinates.
 * @param anchorOrigin - Center origin of the triggering element.
 * @param targetBounds - Bounding box of the target child popover card.
 * @returns True if the cursor is within the safe transit triangle.
 */
export function isCursorInSafeTriangle(
  cursor: Point2D,
  anchorOrigin: Point2D,
  targetBounds: BoundingBox,
): boolean {
  const pA = sharedPointPool.acquire();
  const pB = sharedPointPool.acquire();
  try {
    const { x, y, width, height } = targetBounds;
    if (anchorOrigin.x <= x) {
      // Child popover is positioned to the right: base on left edge
      pA.x = x;
      pA.y = y;
      pB.x = x;
      pB.y = y + height;
    } else if (anchorOrigin.x > x + width) {
      // Child popover is positioned to the left: base on right edge
      pA.x = x + width;
      pA.y = y;
      pB.x = x + width;
      pB.y = y + height;
    } else if (anchorOrigin.y <= y) {
      // Child popover is positioned below: base on top edge
      pA.x = x;
      pA.y = y;
      pB.x = x + width;
      pB.y = y;
    } else {
      // Child popover is positioned above: base on bottom edge
      pA.x = x;
      pA.y = y + height;
      pB.x = x + width;
      pB.y = y + height;
    }
    return isPointInTriangle(cursor, anchorOrigin, pA, pB);
  } finally {
    sharedPointPool.release(pA);
    sharedPointPool.release(pB);
  }
}

/**
 * Checks whether the pointer cursor is either inside the target child card or traversing
 * through the safe corridor triangle connecting the parent anchor to the child.
 *
 * @example
 * ```ts
 * if (isCursorInSafeCorridor(cursorPoint, triggerPoint, childCardBox)) {
 *   // Keep submenu open while user navigates diagonally
 * }
 * ```
 *
 * @param cursor - Current pointer position.
 * @param anchorOrigin - Anchor trigger center.
 * @param targetBounds - Child popover card bounds.
 * @returns True if pointer is within the safe corridor.
 */
export function isCursorInSafeCorridor(
  cursor: Point2D,
  anchorOrigin: Point2D,
  targetBounds: BoundingBox,
): boolean {
  return (
    isPointInBox(cursor, targetBounds) || isCursorInSafeTriangle(cursor, anchorOrigin, targetBounds)
  );
}

