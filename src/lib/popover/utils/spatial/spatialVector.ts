/**
 * 2D Vector & Coordinate Geometry Algebra with Zero-GC In-Place Primitives.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialVector
 */

import type { Point2D } from './spatialEnergy';
import { toFiniteNumber } from '../stylesTransform';
import { clamp } from '../math';

/**
 * Creates a finite sanitized 2D point object.
 *
 * @param x - X coordinate (sanitized to finite number, defaults to 0).
 * @param y - Y coordinate (sanitized to finite number, defaults to 0).
 * @returns Sanitized `Point2D`.
 *
 * @example
 * ```ts
 * const pt = createPoint2D(10, 25);
 * ```
 */
export function createPoint2D(x = 0, y = 0): Point2D {
  return {
    x: toFiniteNumber(x, 0),
    y: toFiniteNumber(y, 0),
  };
}

/**
 * Computes the squared Euclidean distance between two 2D points.
 *
 * @param a - First point.
 * @param b - Second point.
 * @returns Squared Euclidean distance ($\Delta x^2 + \Delta y^2$).
 *
 * @example
 * ```ts
 * const d2 = distanceSquared2D({ x: 0, y: 0 }, { x: 3, y: 4 }); // 25
 * ```
 */
export function distanceSquared2D(a: Point2D, b: Point2D): number {
  const dx = toFiniteNumber(a.x) - toFiniteNumber(b.x);
  const dy = toFiniteNumber(a.y) - toFiniteNumber(b.y);
  return dx * dx + dy * dy;
}

/**
 * Computes the Euclidean distance between two 2D points.
 *
 * @param a - First point.
 * @param b - Second point.
 * @returns Euclidean distance ($\sqrt{\Delta x^2 + \Delta y^2}$).
 *
 * @example
 * ```ts
 * const d = distance2D({ x: 0, y: 0 }, { x: 3, y: 4 }); // 5
 * ```
 */
export function distance2D(a: Point2D, b: Point2D): number {
  return Math.sqrt(distanceSquared2D(a, b));
}

/**
 * Computes the Manhattan (L1 norm / taxicab) distance between two 2D points.
 *
 * @param a - First point.
 * @param b - Second point.
 * @returns Manhattan distance ($|\Delta x| + |\Delta y|$).
 *
 * @example
 * ```ts
 * const m = manhattanDistance2D({ x: 0, y: 0 }, { x: 3, y: 4 }); // 7
 * ```
 */
export function manhattanDistance2D(a: Point2D, b: Point2D): number {
  return (
    Math.abs(toFiniteNumber(a.x) - toFiniteNumber(b.x)) +
    Math.abs(toFiniteNumber(a.y) - toFiniteNumber(b.y))
  );
}

/**
 * Calculates the Euclidean length (magnitude) of a 2D vector from the origin.
 *
 * @param v - Vector coordinates.
 * @returns Vector magnitude ($\sqrt{x^2 + y^2}$).
 *
 * @example
 * ```ts
 * const len = vectorLength2D({ x: 3, y: 4 }); // 5
 * ```
 */
export function vectorLength2D(v: Point2D): number {
  const x = toFiniteNumber(v.x);
  const y = toFiniteNumber(v.y);
  return Math.sqrt(x * x + y * y);
}

/**
 * Computes the algebraic dot product (scalar product) of two 2D vectors.
 *
 * @param a - First vector.
 * @param b - Second vector.
 * @returns Scalar dot product ($a_x b_x + a_y b_y$).
 *
 * @example
 * ```ts
 * const dot = dotProduct2D({ x: 1, y: 0 }, { x: 0, y: 1 }); // 0 (orthogonal)
 * ```
 */
export function dotProduct2D(a: Point2D, b: Point2D): number {
  return toFiniteNumber(a.x) * toFiniteNumber(b.x) + toFiniteNumber(a.y) * toFiniteNumber(b.y);
}

/**
 * Adds two 2D points writing the coordinates directly into `out` without allocating heap memory.
 *
 * @param a - First point.
 * @param b - Second point.
 * @param out - Mutable point object to receive result coordinates.
 *
 * @example
 * ```ts
 * addPoints2DInto(pos, delta, scratchPt);
 * ```
 */
export function addPoints2DInto(a: Point2D, b: Point2D, out: { x: number; y: number }): void {
  out.x = toFiniteNumber(a.x) + toFiniteNumber(b.x);
  out.y = toFiniteNumber(a.y) + toFiniteNumber(b.y);
}

/**
 * Adds two 2D points returning a new `Point2D`.
 *
 * @param a - First point.
 * @param b - Second point.
 * @returns Sum point ($a + b$).
 *
 * @example
 * ```ts
 * const sum = addPoints2D({ x: 10, y: 20 }, { x: 5, y: -5 }); // { x: 15, y: 15 }
 * ```
 */
export function addPoints2D(a: Point2D, b: Point2D): Point2D {
  const out = { x: 0, y: 0 };
  addPoints2DInto(a, b, out);
  return out;
}

/**
 * Subtracts point `b` from point `a` writing into `out` without allocating heap memory.
 *
 * @param a - Minuend point.
 * @param b - Subtrahend point.
 * @param out - Mutable point object to receive result coordinates.
 *
 * @example
 * ```ts
 * subtractPoints2DInto(currentPos, anchorPos, scratchDelta);
 * ```
 */
export function subtractPoints2DInto(a: Point2D, b: Point2D, out: { x: number; y: number }): void {
  out.x = toFiniteNumber(a.x) - toFiniteNumber(b.x);
  out.y = toFiniteNumber(a.y) - toFiniteNumber(b.y);
}

/**
 * Subtracts point `b` from point `a` returning a new `Point2D`.
 *
 * @param a - Minuend point.
 * @param b - Subtrahend point.
 * @returns Difference vector ($a - b$).
 *
 * @example
 * ```ts
 * const diff = subtractPoints2D({ x: 20, y: 30 }, { x: 5, y: 10 }); // { x: 15, y: 20 }
 * ```
 */
export function subtractPoints2D(a: Point2D, b: Point2D): Point2D {
  const out = { x: 0, y: 0 };
  subtractPoints2DInto(a, b, out);
  return out;
}

/**
 * Multiplies a 2D point by a scalar factor writing directly into `out` without heap allocation.
 *
 * @param p - Input point.
 * @param factor - Numeric multiplier.
 * @param out - Mutable target object.
 *
 * @example
 * ```ts
 * scalePoint2DInto(velocity, 0.95, scratchVel);
 * ```
 */
export function scalePoint2DInto(p: Point2D, factor: number, out: { x: number; y: number }): void {
  const f = toFiniteNumber(factor, 1);
  out.x = toFiniteNumber(p.x) * f;
  out.y = toFiniteNumber(p.y) * f;
}

/**
 * Multiplies a 2D point by a scalar factor returning a new `Point2D`.
 *
 * @param p - Input point.
 * @param factor - Numeric multiplier.
 * @returns Scaled point ($p \cdot \text{factor}$).
 *
 * @example
 * ```ts
 * const scaled = scalePoint2D({ x: 10, y: 20 }, 2); // { x: 20, y: 40 }
 * ```
 */
export function scalePoint2D(p: Point2D, factor: number): Point2D {
  const out = { x: 0, y: 0 };
  scalePoint2DInto(p, factor, out);
  return out;
}

/**
 * Performs linear interpolation (lerp) between points `a` and `b` by fraction `t` [0, 1] into `out`.
 *
 * @param a - Starting point ($t = 0$).
 * @param b - Ending point ($t = 1$).
 * @param t - Normalized interpolation factor (clamped between 0 and 1).
 * @param out - Mutable target object.
 *
 * @example
 * ```ts
 * lerpPoint2DInto(startPos, endPos, 0.5, scratchPos);
 * ```
 */
export function lerpPoint2DInto(
  a: Point2D,
  b: Point2D,
  t: number,
  out: { x: number; y: number },
): void {
  const safeT = clamp(toFiniteNumber(t, 0), 0, 1);
  out.x = toFiniteNumber(a.x) + (toFiniteNumber(b.x) - toFiniteNumber(a.x)) * safeT;
  out.y = toFiniteNumber(a.y) + (toFiniteNumber(b.y) - toFiniteNumber(a.y)) * safeT;
}

/**
 * Linearly interpolates between points `a` and `b` by parameter `t` [0, 1].
 *
 * @param a - Starting point ($t = 0$).
 * @param b - Ending point ($t = 1$).
 * @param t - Interpolation parameter.
 * @returns Interpolated point.
 *
 * @example
 * ```ts
 * const midpoint = lerpPoint2D({ x: 0, y: 0 }, { x: 100, y: 100 }, 0.5); // { x: 50, y: 50 }
 * ```
 */
export function lerpPoint2D(a: Point2D, b: Point2D, t: number): Point2D {
  const out = { x: 0, y: 0 };
  lerpPoint2DInto(a, b, t, out);
  return out;
}
