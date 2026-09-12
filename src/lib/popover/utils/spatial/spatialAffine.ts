/**
 * 2D Affine Transformation Matrix & Geometry Normalization.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialAffine
 */

import type { BoundingBox } from '../guards/spatialGuards';
import type { Point2D } from './spatialEnergy';

export type Matrix2D = readonly [a: number, b: number, c: number, d: number, e: number, f: number];

export const IDENTITY_MATRIX: Matrix2D = Object.freeze([1, 0, 0, 1, 0, 0]);

export function identityMatrix(): Matrix2D {
  return IDENTITY_MATRIX;
}

export function multiplyMatrix2D(m1: Matrix2D, m2: Matrix2D): Matrix2D {
  return [
    m1[0] * m2[0] + m1[2] * m2[1], m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3], m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4], m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

export function invertMatrix2D(m: Matrix2D): Matrix2D | null {
  const det = m[0] * m[3] - m[1] * m[2];
  if (!Number.isFinite(det) || Math.abs(det) < 1e-12) return null;
  const invDet = 1 / det;
  return [
    m[3] * invDet, -m[1] * invDet, -m[2] * invDet, m[0] * invDet,
    (m[2] * m[5] - m[3] * m[4]) * invDet, (m[1] * m[4] - m[0] * m[5]) * invDet,
  ];
}

export function transformPoint2DInto(p: Point2D, m: Matrix2D, out: { x: number; y: number }): void {
  const x = m[0] * p.x + m[2] * p.y + m[4];
  const y = m[1] * p.x + m[3] * p.y + m[5];
  out.x = Number.isFinite(x) ? x : 0;
  out.y = Number.isFinite(y) ? y : 0;
}

export function transformPoint2D(p: Point2D, m: Matrix2D): Point2D {
  const out = { x: 0, y: 0 };
  transformPoint2DInto(p, m, out);
  return out;
}

export function inverseTransformPoint2D(p: Point2D, m: Matrix2D): Point2D {
  const inv = invertMatrix2D(m);
  return inv ? transformPoint2D(p, inv) : p;
}

export function transformAABBInto(
  box: BoundingBox,
  m: Matrix2D,
  out: { x: number; y: number; width: number; height: number },
): void {
  const x1 = m[0] * box.x + m[2] * box.y + m[4];
  const y1 = m[1] * box.x + m[3] * box.y + m[5];
  const x2 = m[0] * (box.x + box.width) + m[2] * box.y + m[4];
  const y2 = m[1] * (box.x + box.width) + m[3] * box.y + m[5];
  const x3 = m[0] * box.x + m[2] * (box.y + box.height) + m[4];
  const y3 = m[1] * box.x + m[3] * (box.y + box.height) + m[5];
  const x4 = m[0] * (box.x + box.width) + m[2] * (box.y + box.height) + m[4];
  const y4 = m[1] * (box.x + box.width) + m[3] * (box.y + box.height) + m[5];

  const minX = Math.min(x1, x2, x3, x4);
  const maxX = Math.max(x1, x2, x3, x4);
  const minY = Math.min(y1, y2, y3, y4);
  const maxY = Math.max(y1, y2, y3, y4);

  out.x = minX;
  out.y = minY;
  out.width = maxX - minX;
  out.height = maxY - minY;
}

export function transformAABB(box: BoundingBox, m: Matrix2D): BoundingBox {
  const out = { x: 0, y: 0, width: 0, height: 0 };
  transformAABBInto(box, m, out);
  return out;
}
