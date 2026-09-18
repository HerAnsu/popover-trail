/**
 * Zero-GC In-Place 2D Bounding Box Operations.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialAABBInto
 */

import type { BoundingBox } from '../guards/spatialGuards';
import type { Point2D } from './spatialEnergy';

/**
 * Mutable 2D bounding box structure used for zero-allocation scratch buffers.
 */
export type MutableBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Copies coordinates and dimensions from a source bounding box into a mutable target.
 *
 * @param src - Source bounding box.
 * @param out - Pre-allocated target bounding box to write into.
 *
 * @example
 * ```ts
 * copyBoundingBoxInto(anchorRect, scratchBox);
 * ```
 */
export function copyBoundingBoxInto(src: BoundingBox, out: MutableBoundingBox): void {
  out.x = src.x;
  out.y = src.y;
  out.width = src.width;
  out.height = src.height;
}

/**
 * Computes the intersection of two bounding boxes, writing the resulting coordinates
 * directly into the provided output structure to prevent heap allocation.
 *
 * @param a - First bounding box.
 * @param b - Second bounding box.
 * @param out - Mutable output bounding box.
 * @returns `true` if boxes intersect and `out` was populated; `false` otherwise.
 *
 * @example
 * ```ts
 * if (intersectionBoxInto(boxA, boxB, scratchBox)) {
 *   // scratchBox contains the intersection rect
 * }
 * ```
 */
export function intersectionBoxInto(
  a: BoundingBox,
  b: BoundingBox,
  out: MutableBoundingBox,
): boolean {
  const minX = Math.max(a.x, b.x);
  const maxX = Math.min(a.x + a.width, b.x + b.width);
  if (maxX <= minX) return false;

  const minY = Math.max(a.y, b.y);
  const maxY = Math.min(a.y + a.height, b.y + b.height);
  if (maxY <= minY) return false;

  out.x = minX;
  out.y = minY;
  out.width = maxX - minX;
  out.height = maxY - minY;
  return true;
}

/**
 * Computes the minimal bounding box enclosing both given boxes, writing directly into `out`.
 *
 * @param a - First bounding box.
 * @param b - Second bounding box.
 * @param out - Mutable output bounding box.
 *
 * @example
 * ```ts
 * boundingUnionInto(boxA, boxB, scratchUnionBox);
 * ```
 */
export function boundingUnionInto(a: BoundingBox, b: BoundingBox, out: MutableBoundingBox): void {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x + a.width, b.x + b.width);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y + a.height, b.y + b.height);

  out.x = minX;
  out.y = minY;
  out.width = maxX - minX;
  out.height = maxY - minY;
}

/**
 * Computes the squared Euclidean distance between a 2D point and the perimeter of a bounding box.
 * Avoids costly `Math.sqrt()` computation in hot distance ranking paths.
 *
 * @param point - Point coordinates `{ x, y }`.
 * @param box - Target bounding box.
 * @returns Squared Euclidean distance ($d^2$).
 *
 * @example
 * ```ts
 * const sqDist = distanceToBoxSquared(cursorPos, cardBox);
 * ```
 */
export function distanceToBoxSquared(point: Point2D, box: BoundingBox): number {
  const dx = Math.max(box.x - point.x, 0, point.x - (box.x + box.width));
  const dy = Math.max(box.y - point.y, 0, point.y - (box.y + box.height));
  return dx * dx + dy * dy;
}
