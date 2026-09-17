/**
 * Mathematical and Scalar Geometry Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/math
 */

/**
 * Clamps a numeric value between an inclusive minimum and maximum bound.
 * Safely normalizes NaN or non-finite inputs to the fallback bound.
 *
 * @param value - The numeric value to constrain.
 * @param min - Lower bound.
 * @param max - Upper bound.
 * @returns Number constrained to [min, max].
 *
 * @example
 * ```typescript
 * clamp(15, 0, 10); // => 10
 * clamp(-5, 0, 10); // => 0
 * clamp(7, 0, 10);  // => 7
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  const safeMin = !Number.isNaN(min) ? min : 0;
  const safeMax = !Number.isNaN(max) ? max : safeMin;
  const lower = Math.min(safeMin, safeMax);
  const upper = Math.max(safeMin, safeMax);

  if (Number.isNaN(value)) {
    return lower;
  }
  if (value > upper) {
    return upper;
  }
  if (value < lower) {
    return lower;
  }
  return value;
}

/**
 * Linearly interpolates between two numeric points by a progression factor t.
 *
 * @param start - Starting scalar value.
 * @param end - Target scalar value.
 * @param factor - Interpolation progress ratio (0 = start, 1 = end).
 * @returns Linearly interpolated scalar value.
 *
 * @example
 * ```typescript
 * lerp(0, 100, 0.5); // => 50
 * lerp(10, 20, 0.2); // => 12
 * ```
 */
export function lerp(start: number, end: number, factor: number): number {
  const safeStart = Number.isFinite(start) ? start : 0;
  const safeEnd = Number.isFinite(end) ? end : 0;
  const safeFactor = Number.isFinite(factor) ? factor : 0;
  return safeStart + (safeEnd - safeStart) * safeFactor;
}

/**
 * Checks whether a number is within a bounded interval [min, max] inclusive.
 *
 * @param value - Value to check.
 * @param min - Inclusive lower bound.
 * @param max - Inclusive upper bound.
 * @returns True if value is within bounds and finite.
 *
 * @example
 * ```typescript
 * inRange(5, 0, 10);  // => true
 * inRange(15, 0, 10); // => false
 * ```
 */
export function inRange(value: number, min: number, max: number): boolean {
  if (!Number.isFinite(value)) return false;
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : safeMin;
  const lower = Math.min(safeMin, safeMax);
  const upper = Math.max(safeMin, safeMax);
  return value >= lower && value <= upper;
}

/**
 * Converts degrees to radians.
 *
 * @param degrees - Angle in degrees.
 * @returns Angle in radians.
 *
 * @example
 * ```typescript
 * degToRad(180); // => Math.PI
 * degToRad(90);  // => Math.PI / 2
 * ```
 */
export function degToRad(degrees: number): number {
  return ((Number.isFinite(degrees) ? degrees : 0) * Math.PI) / 180;
}

/**
 * Converts radians to degrees.
 *
 * @param radians - Angle in radians.
 * @returns Angle in degrees.
 *
 * @example
 * ```typescript
 * radToDeg(Math.PI);     // => 180
 * radToDeg(Math.PI / 2); // => 90
 * ```
 */
export function radToDeg(radians: number): number {
  return ((Number.isFinite(radians) ? radians : 0) * 180) / Math.PI;
}

/**
 * Rounds a numeric scalar to the specified number of decimal digits safely.
 *
 * @param value - Float number to round.
 * @param decimals - Decimal precision places (clamped between 0 and 15, default 0).
 * @returns Correctly rounded number.
 *
 * @example
 * ```typescript
 * roundTo(3.14159, 2); // => 3.14
 * roundTo(4.55, 1);    // => 4.6
 * ```
 */
export function roundTo(value: number, decimals = 0): number {
  if (!Number.isFinite(value)) return 0;
  const safeDecimals = clamp(Math.trunc(decimals), 0, 15);
  if (safeDecimals === 0) return Math.round(value);
  const factor = 10 ** safeDecimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Evaluates whether two numbers are approximately equal within a tolerance threshold (epsilon).
 *
 * @param a - First number.
 * @param b - Second number.
 * @param epsilon - Allowed difference threshold (default 1e-6).
 * @returns True if the absolute difference does not exceed epsilon.
 *
 * @example
 * ```typescript
 * approxEqual(0.1 + 0.2, 0.3); // => true
 * approxEqual(1.0, 1.05, 0.01); // => false
 * ```
 */
export function approxEqual(a: number, b: number, epsilon = 1e-6): boolean {
  if (a === b) return true;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= epsilon;
}

/**
 * Computes the normalized ratio $t \in [0, 1]$ corresponding to value between min and max.
 * Inverse of linear interpolation (`lerp`).
 *
 * @param value - Value to normalize.
 * @param min - Lower reference bound.
 * @param max - Upper reference bound.
 * @returns Normalized factor clamped between 0 and 1.
 *
 * @example
 * ```typescript
 * normalizeRatio(50, 0, 100); // => 0.5
 * normalizeRatio(25, 0, 100); // => 0.25
 * ```
 */
export function normalizeRatio(value: number, min: number, max: number): number {
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : safeMin;
  const lower = Math.min(safeMin, safeMax);
  const upper = Math.max(safeMin, safeMax);
  if (lower === upper) return 0;
  const clamped = clamp(value, lower, upper);
  return (clamped - lower) / (upper - lower);
}

/**
 * Normalizes an unknown value to a finite number, returning fallback if non-finite.
 *
 * @param val - Input value to normalize.
 * @param fallback - Fallback number if non-finite (defaults to 0).
 * @returns Finite number.
 *
 * @example
 * ```typescript
 * toFiniteNumber(42, 0);       // => 42
 * toFiniteNumber('abc', 10);   // => 10
 * toFiniteNumber(Infinity, 0); // => 0
 * ```
 */
export function toFiniteNumber(val: unknown, fallback = 0): number {
  return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}

