/**
 * Numeric Bounds and Validation Type Guards.
 *
 * @module utils/guards/numberGuards
 */

import { and } from '../functional';

/** Checks if a value is a valid finite number. */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Checks if a value is a valid finite number within the inclusive range [min, max]. */
export function isNumberInRange(value: unknown, min: number, max: number): value is number {
  const inRange = and(
    (v: number) => v >= min,
    (v: number) => v <= max,
  );
  return isFiniteNumber(value) && inRange(value);
}

/** Checks if a value is a valid finite number greater than or equal to 0. */
export function isNonNegativeFinite(value: unknown): value is number {
  return isFiniteNumber(value) && value >= 0;
}

/** Checks if a value is a valid finite positive number strictly greater than 0. */
export function isPositiveFinite(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}

/** Checks if a coordinate value is a valid finite number within [-limit, limit]. */
export function isCoordinateWithinBounds(value: unknown, limit = 10000): value is number {
  return isFiniteNumber(value) && Math.abs(value) <= limit;
}

/** Checks if both X and Y coordinates are valid finite numbers within [-limit, limit]. */
export function areCoordinatesWithinBounds(x: unknown, y: unknown, limit = 10000): boolean {
  const withinLimit = and(
    (c: readonly [unknown, unknown]) => isCoordinateWithinBounds(c[0], limit),
    (c: readonly [unknown, unknown]) => isCoordinateWithinBounds(c[1], limit),
  );
  return withinLimit([x, y]);
}

/** Sanitizes an unknown numeric candidate to a safe finite number with default fallback. */
export function toFiniteOrDefault(value: unknown, fallback = 0): number {
  return isFiniteNumber(value) ? value : fallback;
}

/** Checks if an object has finite coordinate properties x and y. */
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

/** Checks if an object has finite rectangular coordinates top and left. */
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
