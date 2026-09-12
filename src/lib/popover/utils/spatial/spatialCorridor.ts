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

function sign(p1: Point2D, p2: Point2D, p3: Point2D): number {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}

export function isPointInTriangle(p: Point2D, a: Point2D, b: Point2D, c: Point2D): boolean {
  const d1 = sign(p, a, b);
  const d2 = sign(p, b, c);
  const d3 = sign(p, c, a);

  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

  return !(hasNeg && hasPos);
}

export function isPointInBox(p: Point2D, box: BoundingBox): boolean {
  return p.x >= box.x && p.x <= box.x + box.width && p.y >= box.y && p.y <= box.y + box.height;
}

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
      pA.x = x;
      pA.y = y;
      pB.x = x;
      pB.y = y + height;
    } else if (anchorOrigin.x > x + width) {
      pA.x = x + width;
      pA.y = y;
      pB.x = x + width;
      pB.y = y + height;
    } else if (anchorOrigin.y <= y) {
      pA.x = x;
      pA.y = y;
      pB.x = x + width;
      pB.y = y;
    } else {
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

export function isCursorInSafeCorridor(
  cursor: Point2D,
  anchorOrigin: Point2D,
  targetBounds: BoundingBox,
): boolean {
  return (
    isPointInBox(cursor, targetBounds) || isCursorInSafeTriangle(cursor, anchorOrigin, targetBounds)
  );
}
