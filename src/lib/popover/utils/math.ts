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
 */
export function clamp(value: number, min: number, max: number): number {
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : safeMin;
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
 */
export function degToRad(degrees: number): number {
  return ((Number.isFinite(degrees) ? degrees : 0) * Math.PI) / 180;
}

/**
 * Converts radians to degrees.
 *
 * @param radians - Angle in radians.
 * @returns Angle in degrees.
 */
export function radToDeg(radians: number): number {
  return ((Number.isFinite(radians) ? radians : 0) * 180) / Math.PI;
}
