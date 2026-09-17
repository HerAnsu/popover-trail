/**
 * Axis-Aligned Bounding Box (AABB) 2D geometry metrics and overlap algebra.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialAABB
 */

import type { BoundingBox } from '../guards/spatialGuards';

/**
 * Computes the rectangular intersection of two axis-aligned bounding boxes (AABBs).
 *
 * @param a - First bounding box.
 * @param b - Second bounding box.
 * @returns The overlapping `BoundingBox`, or `null` if the boxes do not intersect.
 *
 * @example
 * ```ts
 * const overlap = intersectionBox({ x: 0, y: 0, width: 100, height: 100 }, { x: 50, y: 50, width: 100, height: 100 });
 * // returns { x: 50, y: 50, width: 50, height: 50 }
 * ```
 */
export function intersectionBox(a: BoundingBox, b: BoundingBox): BoundingBox | null {
  const minX = Math.max(a.x, b.x);
  const maxX = Math.min(a.x + a.width, b.x + b.width);
  const minY = Math.max(a.y, b.y);
  const maxY = Math.min(a.y + a.height, b.y + b.height);

  if (maxX <= minX || maxY <= minY) return null;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * Calculates the numeric area of intersection between two bounding boxes.
 *
 * @param a - First bounding box.
 * @param b - Second bounding box.
 * @returns Non-negative area in square pixels (0 if no intersection).
 *
 * @example
 * ```ts
 * const area = intersectionArea(boxA, boxB);
 * ```
 */
export function intersectionArea(a: BoundingBox, b: BoundingBox): number {
  const minX = Math.max(a.x, b.x);
  const maxX = Math.min(a.x + a.width, b.x + b.width);
  if (maxX <= minX) return 0;

  const minY = Math.max(a.y, b.y);
  const maxY = Math.min(a.y + a.height, b.y + b.height);
  if (maxY <= minY) return 0;

  return (maxX - minX) * (maxY - minY);
}

/**
 * Computes the minimal bounding box enclosing both given bounding boxes (AABB Union).
 *
 * @param a - First bounding box.
 * @param b - Second bounding box.
 * @returns The combined bounding box enclosing both `a` and `b`.
 *
 * @example
 * ```ts
 * const united = boundingUnion(boxA, boxB);
 * ```
 */
export function boundingUnion(a: BoundingBox, b: BoundingBox): BoundingBox {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x + a.width, b.x + b.width);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y + a.height, b.y + b.height);

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * Calculates the Intersection-over-Union (IoU) overlap ratio between two bounding boxes.
 *
 * $$\text{IoU} = \frac{\text{Area}(A \cap B)}{\text{Area}(A \cup B)}$$
 *
 * @param a - First bounding box.
 * @param b - Second bounding box.
 * @returns Float value between 0.0 (no overlap) and 1.0 (identical bounds).
 *
 * @example
 * ```ts
 * const ratio = overlapRatio(cardBox, obstacleBox);
 * if (ratio > 0.5) { ... }
 * ```
 */
export function overlapRatio(a: BoundingBox, b: BoundingBox): number {
  const inter = intersectionArea(a, b);
  if (inter <= 0) return 0;
  const union = a.width * a.height + b.width * b.height - inter;
  return union > 0 ? inter / union : 0;
}

/**
 * Computes the minimum Euclidean distance from a 2D point to the perimeter of a bounding box.
 * If the point is inside the bounding box, returns 0.
 *
 * @param point - Target 2D coordinate point `{ x, y }`.
 * @param box - Bounding box.
 * @returns Euclidean distance in pixels.
 *
 * @example
 * ```ts
 * const dist = distanceToBox({ x: 10, y: 10 }, { x: 50, y: 50, width: 100, height: 100 });
 * ```
 */
export function distanceToBox(
  point: { readonly x: number; readonly y: number },
  box: BoundingBox,
): number {
  const dx = Math.max(box.x - point.x, 0, point.x - (box.x + box.width));
  const dy = Math.max(box.y - point.y, 0, point.y - (box.y + box.height));
  return Math.hypot(dx, dy);
}
