/**
 * Numeric Bounds and Validation Type Guards.
 *
 * @module utils/guards/numberGuards
 */

import { and } from '../functional';

/**
 * Type guard verifying if a candidate value is a valid finite number.
 *
 * @param value - Candidate value to evaluate.
 * @returns True if `value` is a finite number.
 *
 * @example
 * ```typescript
 * isFiniteNumber(42);       // => true
 * isFiniteNumber(NaN);      // => false
 * isFiniteNumber(Infinity); // => false
 * ```
 */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Checks if a candidate value is a finite number within the inclusive range [min, max].
 *
 * @param value - Candidate value to test.
 * @param min - Lower bound (inclusive).
 * @param max - Upper bound (inclusive).
 * @returns True if `value` is finite and within [min, max].
 *
 * @example
 * ```typescript
 * isNumberInRange(5, 0, 10);  // => true
 * isNumberInRange(15, 0, 10); // => false
 * ```
 */
export function isNumberInRange(value: unknown, min: number, max: number): value is number {
  const inRange = and(
    (v: number) => v >= min,
    (v: number) => v <= max,
  );
  return isFiniteNumber(value) && inRange(value);
}

/**
 * Checks if a candidate value is a finite number greater than or equal to 0.
 *
 * @param value - Candidate value to evaluate.
 * @returns True if `value` is non-negative and finite.
 *
 * @example
 * ```typescript
 * isNonNegativeFinite(0);  // => true
 * isNonNegativeFinite(-1); // => false
 * ```
 */
export function isNonNegativeFinite(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0;
}

/**
 * Checks if a candidate value is a finite positive number strictly greater than 0.
 *
 * @param value - Candidate value to evaluate.
 * @returns True if `value` is positive and finite.
 *
 * @example
 * ```typescript
 * isPositiveFinite(1); // => true
 * isPositiveFinite(0); // => false
 * ```
 */
export function isPositiveFinite(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}

/**
 * Checks if a coordinate value is a valid finite number within `[-limit, limit]`.
 *
 * @param value - Candidate coordinate value.
 * @param limit - Absolute maximum bound (defaults to 10000).
 * @returns True if `value` is finite and within bounds.
 *
 * @example
 * ```typescript
 * isCoordinateWithinBounds(250);       // => true
 * isCoordinateWithinBounds(999999);    // => false
 * ```
 */
export function isCoordinateWithinBounds(value: unknown, limit = 10000): value is number {
  return isFiniteNumber(value) && Math.abs(value) <= limit;
}

/**
 * Checks if both X and Y coordinates are valid finite numbers within `[-limit, limit]`.
 *
 * @param x - Horizontal coordinate candidate.
 * @param y - Vertical coordinate candidate.
 * @param limit - Absolute maximum bound (defaults to 10000).
 * @returns True if both coordinates are within bounds.
 *
 * @example
 * ```typescript
 * areCoordinatesWithinBounds(100, 200); // => true
 * ```
 */
export function areCoordinatesWithinBounds(x: unknown, y: unknown, limit = 10000): boolean {
  const withinLimit = and(
    (c: readonly [unknown, unknown]) => isCoordinateWithinBounds(c[0], limit),
    (c: readonly [unknown, unknown]) => isCoordinateWithinBounds(c[1], limit),
  );
  return withinLimit([x, y]);
}

/**
 * Sanitizes an unknown numeric candidate to a safe finite number with default fallback.
 *
 * @param value - Candidate value to sanitize.
 * @param fallback - Safe number to return if candidate is non-finite (defaults to 0).
 * @returns Finite number value.
 *
 * @example
 * ```typescript
 * toFiniteOrDefault(42);          // => 42
 * toFiniteOrDefault(NaN, 10);     // => 10
 * toFiniteOrDefault(undefined, 0);// => 0
 * ```
 */
export function toFiniteOrDefault(value: unknown, fallback = 0): number {
  return isFiniteNumber(value) ? value : fallback;
}

/**
 * Type guard verifying if an object has finite coordinate properties `x` and `y`.
 *
 * @param pt - Candidate point object.
 * @returns True if object contains finite `x` and `y` numeric fields.
 *
 * @example
 * ```typescript
 * isFinitePoint({ x: 10, y: 20 }); // => true
 * isFinitePoint({ x: NaN, y: 0 }); // => false
 * ```
 */
export function isFinitePoint(pt: unknown): pt is { x: number; y: number } {
  return (
    typeof pt === 'object' &&
    pt !== null &&
    'x' in pt &&
    'y' in pt &&
    isFiniteNumber(pt.x) &&
    isFiniteNumber(pt.y)
  );
}

/**
 * Type guard verifying if an object has finite rectangular coordinates `top` and `left`.
 *
 * @param rect - Candidate rect object.
 * @returns True if object contains finite `top` and `left` numeric fields.
 *
 * @example
 * ```typescript
 * isFiniteRect({ top: 10, left: 20 }); // => true
 * ```
 */
export function isFiniteRect(rect: unknown): rect is { top: number; left: number } {
  return (
    typeof rect === 'object' &&
    rect !== null &&
    'top' in rect &&
    'left' in rect &&
    isFiniteNumber(rect.top) &&
    isFiniteNumber(rect.left)
  );
}
