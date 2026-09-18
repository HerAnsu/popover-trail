/**
 * 2D Affine Transformation Matrix & Geometry Normalization.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialAffine
 */

import type { BoundingBox } from '../guards/spatialGuards';
import type { Point2D } from './spatialEnergy';
import { Ok, Err, type Result } from '../result';
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
 * `[a, b, c, d, e, f]` matching the standard CSS `matrix(a, b, c, d, e, f)`.
 *
 * Mapped to tuple indices:
 * - `m[0] = a`: Horizontal scale / cosine
 * - `m[1] = b`: Vertical skew / sine
 * - `m[2] = c`: Horizontal skew / -sine
 * - `m[3] = d`: Vertical scale / cosine
 * - `m[4] = e`: Horizontal translation (delta X)
 * - `m[5] = f`: Vertical translation (delta Y)
 */
export type Matrix2D = readonly [a: number, b: number, c: number, d: number, e: number, f: number];

/**
 * Standard identity transformation matrix `[1, 0, 0, 1, 0, 0]` (zero translation, scale 1:1, zero skew).
 */
export const IDENTITY_MATRIX: Matrix2D = Object.freeze([1, 0, 0, 1, 0, 0]);

/**
 * Returns the immutable identity affine matrix singleton.
 *
 * @example
 * ```typescript
 * const m = identityMatrix(); // [1, 0, 0, 1, 0, 0]
 * ```
 */
export function identityMatrix(): Matrix2D {
  return IDENTITY_MATRIX;
}

/**
 * Multiplies two 2D affine matrices (`m1 * m2`) to compose transformations.
 *
 * Useful when combining nested container transforms, such as a scaled modal inside
 * a translated wrapper.
 *
 * @param m1 - Left-hand matrix operand.
 * @param m2 - Right-hand matrix operand.
 * @returns Resulting composite 2D affine transformation matrix.
 *
 * @example
 * ```typescript
 * const combined = multiplyMatrix2D(wrapperMatrix, modalMatrix);
 * ```
 */
export function multiplyMatrix2D(m1: Matrix2D, m2: Matrix2D): Matrix2D {
  const [a1, b1, c1, d1, e1, f1] = m1;
  const [a2, b2, c2, d2, e2, f2] = m2;

  return [
    a1 * a2 + c1 * b2,
    b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2,
    b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1,
    b1 * e2 + d1 * f2 + f1,
  ];
}

/**
 * Computes the inverse matrix of a 2D affine transformation matrix.
 *
 * Used to convert global screen coordinates into coordinates local to a CSS-transformed container.
 * If the determinant is close to zero or non-finite (singular matrix), returns `null` to avoid `NaN`.
 *
 * @param m - Matrix to invert.
 * @returns Inverted `Matrix2D` or `null` if the matrix is singular.
 *
 * @example
 * ```typescript
 * const inv = invertMatrix2D(containerMatrix);
 * if (inv) {
 *   const localPoint = transformPoint2D(screenPoint, inv);
 * }
 * ```
 */
export function invertMatrix2D(m: Matrix2D): Matrix2D | null {
  const [a, b, c, d, e, f] = m;
  const det = a * d - b * c;
  if (!Number.isFinite(det) || approxEqual(det, 0, 1e-12)) return null;
  const invDet = 1 / det;
  return [
    d * invDet,
    -b * invDet,
    -c * invDet,
    a * invDet,
    (c * f - d * e) * invDet,
    (b * e - a * f) * invDet,
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
  const [a, b, c, d, e, f] = m;
  const det = a * d - b * c;
  if (!Number.isFinite(det) || approxEqual(det, 0, 1e-12)) {
    return Err({
      type: 'singular_matrix',
      message: `Cannot invert singular 2D affine matrix with determinant ${det}.`,
      determinant: det,
    });
  }
  const invDet = 1 / det;
  return Ok([
    d * invDet,
    -b * invDet,
    -c * invDet,
    a * invDet,
    (c * f - d * e) * invDet,
    (b * e - a * f) * invDet,
  ]);
}

/**
 * Transforms a 2D point in-place using matrix multiplication without heap allocations.
 *
 * Designed for animation loops and pointer tracking where allocating `{ x, y }` objects
 * would trigger garbage collector pauses.
 *
 * @param p - Source 2D point.
 * @param m - Affine matrix.
 * @param out - Pre-allocated target object to receive the transformed coordinates.
 *
 * @example
 * ```typescript
 * const scratch = { x: 0, y: 0 };
 * transformPoint2DInto({ x: 10, y: 20 }, matrix, scratch);
 * ```
 */
export function transformPoint2DInto(p: Point2D, m: Matrix2D, out: { x: number; y: number }): void {
  const [a, b, c, d, e, f] = m;
  const { x: px, y: py } = p;
  const x = a * px + c * py + e;
  const y = b * px + d * py + f;
  out.x = Number.isFinite(x) ? x : 0;
  out.y = Number.isFinite(y) ? y : 0;
}

/**
 * Transforms a 2D point coordinates by an affine transformation matrix.
 *
 * @param p - 2D point to transform.
 * @param m - Affine transformation matrix.
 * @returns Transformed point coordinates `{ x, y }`.
 *
 * @example
 * ```typescript
 * const transformed = transformPoint2D({ x: 10, y: 20 }, scaleMatrix);
 * ```
 */
export function transformPoint2D(p: Point2D, m: Matrix2D): Point2D {
  const out = { x: 0, y: 0 };
  transformPoint2DInto(p, m, out);
  return out;
}

/**
 * Normalizes a screen coordinate back to local container space using inverse matrix transformation.
 *
 * If the matrix is singular (uninvertible), the original point `p` is returned unchanged.
 *
 * @param p - Transformed screen point (e.g. from mouse event clientX, clientY).
 * @param m - Forward transformation matrix of the container.
 * @returns Normalized point in container-local coordinates.
 *
 * @example
 * ```typescript
 * const localPoint = inverseTransformPoint2D({ x: e.clientX, y: e.clientY }, containerMatrix);
 * ```
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
 *
 * @example
 * ```typescript
 * const scratchBox = { x: 0, y: 0, width: 0, height: 0 };
 * transformAABBInto(popoverBox, transformMatrix, scratchBox);
 * ```
 */
export function transformAABBInto(
  box: BoundingBox,
  m: Matrix2D,
  out: { x: number; y: number; width: number; height: number },
): void {
  const [a, b, c, d, e, f] = m;
  const { x: bx, y: by, width: bw, height: bh } = box;
  const right = bx + bw;
  const bottom = by + bh;

  // Transform all four orthogonal corners of the bounding rectangle
  const x1 = a * bx + c * by + e;
  const y1 = b * bx + d * by + f;
  const x2 = a * right + c * by + e;
  const y2 = b * right + d * by + f;
  const x3 = a * bx + c * bottom + e;
  const y3 = b * bx + d * bottom + f;
  const x4 = a * right + c * bottom + e;
  const y4 = b * right + d * bottom + f;

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
 *
 * @example
 * ```typescript
 * const transformedBounds = transformAABB(cardBounds, scaleAndTranslateMatrix);
 * ```
 */
export function transformAABB(box: BoundingBox, m: Matrix2D): BoundingBox {
  const out = { x: 0, y: 0, width: 0, height: 0 };
  transformAABBInto(box, m, out);
  return out;
}
