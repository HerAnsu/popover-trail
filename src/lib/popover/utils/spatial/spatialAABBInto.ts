/**
 * Zero-GC In-Place 2D Bounding Box Operations.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialAABBInto
 */

import type { BoundingBox } from '../guards/spatialGuards';
import type { Point2D } from './spatialEnergy';

export type MutableBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function copyBoundingBoxInto(src: BoundingBox, out: MutableBoundingBox): void {
  out.x = src.x;
  out.y = src.y;
  out.width = src.width;
  out.height = src.height;
}

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

export function distanceToBoxSquared(point: Point2D, box: BoundingBox): number {
  const dx = Math.max(box.x - point.x, 0, point.x - (box.x + box.width));
  const dy = Math.max(box.y - point.y, 0, point.y - (box.y + box.height));
  return dx * dx + dy * dy;
}
