/**
 * Axis-Aligned Bounding Box (AABB) 2D geometry metrics and overlap algebra.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialAABB
 */

import type { BoundingBox } from '../guards/spatialGuards';

export function intersectionBox(a: BoundingBox, b: BoundingBox): BoundingBox | null {
  const minX = Math.max(a.x, b.x);
  const maxX = Math.min(a.x + a.width, b.x + b.width);
  const minY = Math.max(a.y, b.y);
  const maxY = Math.min(a.y + a.height, b.y + b.height);

  if (maxX <= minX || maxY <= minY) return null;
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function intersectionArea(a: BoundingBox, b: BoundingBox): number {
  const minX = Math.max(a.x, b.x);
  const maxX = Math.min(a.x + a.width, b.x + b.width);
  if (maxX <= minX) return 0;

  const minY = Math.max(a.y, b.y);
  const maxY = Math.min(a.y + a.height, b.y + b.height);
  if (maxY <= minY) return 0;

  return (maxX - minX) * (maxY - minY);
}

export function boundingUnion(a: BoundingBox, b: BoundingBox): BoundingBox {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x + a.width, b.x + b.width);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y + a.height, b.y + b.height);

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function overlapRatio(a: BoundingBox, b: BoundingBox): number {
  const inter = intersectionArea(a, b);
  if (inter <= 0) return 0;
  const union = a.width * a.height + b.width * b.height - inter;
  return union > 0 ? inter / union : 0;
}

export function distanceToBox(
  point: { readonly x: number; readonly y: number },
  box: BoundingBox,
): number {
  const dx = Math.max(box.x - point.x, 0, point.x - (box.x + box.width));
  const dy = Math.max(box.y - point.y, 0, point.y - (box.y + box.height));
  return Math.hypot(dx, dy);
}
