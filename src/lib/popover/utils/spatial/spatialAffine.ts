/**
 * 2D Affine Transformation Matrix & Geometry Normalization.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialAffine
 */

import type { BoundingBox } from '../guards/spatialGuards';
import type { Point2D } from './spatialEnergy';
import { ok, err, type Result } from '../result';
import { approxEqual } from '../math';

/**
 * Diagnostic error payload returned when a 2D affine matrix cannot be inverted due to singularity.
 *
 * @remarks
 * Occurs when the determinant $\det(M) = ad - bc$ is approximately zero ($|\det(M)| < 10^{-12}$)
 * or non-finite, meaning the matrix collapses dimensions (e.g. zero scale or infinite coordinates).
 */
export interface SingularMatrixError {
  readonly type: 'singular_matrix';
  /** Human-readable explanation of the singular matrix condition. */
  readonly message: string;
  /** Evaluated determinant value. */
  readonly determinant: number;
}

/**
 * Six-element tuple representing a 2D affine transformation matrix:
 *
 * $$\begin{pmatrix} a & c & e \\ b & d & f \\ 0 & 0 & 1 \end{pmatrix}$$
 *
 * Mapped to tuple indices: `[a, b, c, d, e, f]` corresponding to:
 * - `m[0] = a`: Horizontal scale / cosine
 * - `m[1] = b`: Vertical skew / sine
 * - `m[2] = c`: Horizontal skew / -sine
 * - `m[3] = d`: Vertical scale / cosine
 * - `m[4] = e`: Horizontal translation ($\Delta x$)
 * - `m[5] = f`: Vertical translation ($\Delta y$)
 */
export type Matrix2D = readonly [a: number, b: number, c: number, d: number, e: number, f: number];

/**
 * Standard identity transformation matrix $[1, 0, 0, 1, 0, 0]$ (zero translation, scale 1:1, zero skew).
 */
export const IDENTITY_MATRIX: Matrix2D = Object.freeze([1, 0, 0, 1, 0, 0]);

/**
 * Returns the immutable identity affine matrix singleton.
 */
export function identityMatrix(): Matrix2D {
  return IDENTITY_MATRIX;
}

/**
 * Computes the matrix multiplication of two 2D affine matrices: $M = M_1 \cdot M_2$.
 *
 * @param m1 - Left-hand matrix operand.
 * @param m2 - Right-hand matrix operand.
 * @returns Resulting composite 2D affine transformation matrix.
 */
export function multiplyMatrix2D(m1: Matrix2D, m2: Matrix2D): Matrix2D {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

/**
 * Computes the inverse matrix $M^{-1}$ of a 2D affine transformation matrix.
 *
 * @remarks
 * If $|\det(M)| < 10^{-12}$ or $\det(M)$ is non-finite, returns `null` instead of generating `NaN` or `Infinity`.
 *
 * @param m - Matrix to invert.
 * @returns Inverted `Matrix2D` or `null` if singular.
 */
export function invertMatrix2D(m: Matrix2D): Matrix2D | null {
  const det = m[0] * m[3] - m[1] * m[2];
  if (!Number.isFinite(det) || approxEqual(det, 0, 1e-12)) return null;
  const invDet = 1 / det;
  return [
    m[3] * invDet,
    -m[1] * invDet,
    -m[2] * invDet,
    m[0] * invDet,
    (m[2] * m[5] - m[3] * m[4]) * invDet,
    (m[1] * m[4] - m[0] * m[5]) * invDet,
  ];
}

/**
 * Inverts a 2D affine transform matrix, returning a `Result`.
 *
 * @remarks
 * Useful when converting screen coordinates to coordinates inside a CSS-transformed container.
 * Returns `Ok(inverse)` on success, or `Err(SingularMatrixError)` if the matrix is collapsed
 * (determinant close to zero) and cannot be inverted.
 *
 * @example
 * ```ts
 * const invResult = invertMatrix2DResult(containerMatrix);
 * if (isOk(invResult)) {
 *   const localPoint = transformPoint2D(screenPoint, invResult.value);
 * }
 * ```
 *
 * @param m - Affine matrix to invert.
 * @returns `Result` with inverted matrix or singular error.
 */
export function invertMatrix2DResult(m: Matrix2D): Result<Matrix2D, SingularMatrixError> {
  // Determinant: ad - bc
  const det = m[0] * m[3] - m[1] * m[2];
  if (!Number.isFinite(det) || approxEqual(det, 0, 1e-12)) {
    return err({
      type: 'singular_matrix',
      message: `Cannot invert singular 2D affine matrix with determinant ${det}.`,
      determinant: det,
    });
  }
  const invDet = 1 / det;
  return ok([
    m[3] * invDet,
    -m[1] * invDet,
    -m[2] * invDet,
    m[0] * invDet,
    (m[2] * m[5] - m[3] * m[4]) * invDet,
    (m[1] * m[4] - m[0] * m[5]) * invDet,
  ]);
}

/**
 * Pragmatic alias for invertMatrix2DResult. Inverts an affine transformation matrix safely.
 */
export const tryInvertMatrix = invertMatrix2DResult;

/**
 * Pragmatic alias for invertMatrix2DResult.
 */
export const invertMatrix = invertMatrix2DResult;

/**
 * Transforms a 2D point in-place using matrix multiplication without heap allocations.
 *
 * @param p - Source 2D point.
 * @param m - Affine matrix.
 * @param out - Pre-allocated target object to receive the transformed coordinates.
 */
export function transformPoint2DInto(p: Point2D, m: Matrix2D, out: { x: number; y: number }): void {
  const x = m[0] * p.x + m[2] * p.y + m[4];
  const y = m[1] * p.x + m[3] * p.y + m[5];
  out.x = Number.isFinite(x) ? x : 0;
  out.y = Number.isFinite(y) ? y : 0;
}

/**
 * Transforms a 2D point $P = (x, y)$ by an affine transformation matrix $M$.
 *
 * @param p - 2D point to transform.
 * @param m - Affine transformation matrix.
 * @returns Transformed point coordinates $(x', y')$.
 */
export function transformPoint2D(p: Point2D, m: Matrix2D): Point2D {
  const out = { x: 0, y: 0 };
  transformPoint2DInto(p, m, out);
  return out;
}

/**
 * Normalizes a screen coordinate back to local container space using inverse matrix transformation.
 *
 * @remarks
 * If the matrix is singular (uninvertible), the original point $p$ is returned unchanged.
 *
 * @param p - Transformed screen point.
 * @param m - Forward transformation matrix of the container.
 * @returns Normalized local point.
 */
export function inverseTransformPoint2D(p: Point2D, m: Matrix2D): Point2D {
  const inv = invertMatrix2D(m);
  return inv ? transformPoint2D(p, inv) : p;
}

/**
 * Computes the axis-aligned bounding box of a transformed rectangle in-place without heap allocations.
 *
 * @param box - Source bounding box.
 * @param m - Affine matrix.
 * @param out - Pre-allocated target object to receive the enclosing envelope.
 */
export function transformAABBInto(
  box: BoundingBox,
  m: Matrix2D,
  out: { x: number; y: number; width: number; height: number },
): void {
  // Transform all four orthogonal corners of the bounding rectangle
  const x1 = m[0] * box.x + m[2] * box.y + m[4];
  const y1 = m[1] * box.x + m[3] * box.y + m[5];
  const x2 = m[0] * (box.x + box.width) + m[2] * box.y + m[4];
  const y2 = m[1] * (box.x + box.width) + m[3] * box.y + m[5];
  const x3 = m[0] * box.x + m[2] * (box.y + box.height) + m[4];
  const y3 = m[1] * box.x + m[3] * (box.y + box.height) + m[5];
  const x4 = m[0] * (box.x + box.width) + m[2] * (box.y + box.height) + m[4];
  const y4 = m[1] * (box.x + box.width) + m[3] * (box.y + box.height) + m[5];

  // Compute minimum enclosing axis-aligned rectangle (AABB)
  const minX = Math.min(x1, x2, x3, x4);
  const maxX = Math.max(x1, x2, x3, x4);
  const minY = Math.min(y1, y2, y3, y4);
  const maxY = Math.max(y1, y2, y3, y4);

  out.x = minX;
  out.y = minY;
  out.width = maxX - minX;
  out.height = maxY - minY;
}

/**
 * Transforms an axis-aligned bounding box (AABB) by an affine matrix, returning the minimum enclosing AABB.
 *
 * @param box - Source bounding box.
 * @param m - Affine matrix.
 * @returns New enclosing `BoundingBox`.
 */
export function transformAABB(box: BoundingBox, m: Matrix2D): BoundingBox {
  const out = { x: 0, y: 0, width: 0, height: 0 };
  transformAABBInto(box, m, out);
  return out;
}
