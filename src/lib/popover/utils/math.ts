/**
 * Mathematical and Scalar Geometry Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/math
 */

/**
 * Clamps a numeric value between an inclusive minimum and maximum bound.
 * Safely normalizes NaN or non-finite inputs to the fallback bound.
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

/** Linearly interpolates between two numeric points by factor t. */
export function lerp(start: number, end: number, factor: number): number {
  const safeStart = Number.isFinite(start) ? start : 0;
  const safeEnd = Number.isFinite(end) ? end : 0;
  const safeFactor = Number.isFinite(factor) ? factor : 0;
  return safeStart + (safeEnd - safeStart) * safeFactor;
}

/** Checks whether a number is within a bounded interval [min, max] inclusive. */
export function inRange(value: number, min: number, max: number): boolean {
  if (!Number.isFinite(value)) return false;
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : safeMin;
  const lower = Math.min(safeMin, safeMax);
  const upper = Math.max(safeMin, safeMax);
  return value >= lower && value <= upper;
}

/** Converts degrees to radians. */
export function degToRad(degrees: number): number {
  return ((Number.isFinite(degrees) ? degrees : 0) * Math.PI) / 180;
}

/** Converts radians to degrees. */
export function radToDeg(radians: number): number {
  return ((Number.isFinite(radians) ? radians : 0) * 180) / Math.PI;
}

/** Rounds a numeric scalar to the specified number of decimal digits safely. */
export function roundTo(value: number, decimals = 0): number {
  if (!Number.isFinite(value)) return 0;
  const safeDecimals = clamp(Math.trunc(decimals), 0, 15);
  if (safeDecimals === 0) return Math.round(value);
  const factor = 10 ** safeDecimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/** Evaluates whether two numbers are approximately equal within tolerance epsilon. */
export function approxEqual(a: number, b: number, epsilon = 1e-6): boolean {
  if (a === b) return true;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= epsilon;
}

/** Computes the normalized ratio t in [0, 1] between min and max (inverse lerp). */
export function normalizeRatio(value: number, min: number, max: number): number {
  const safeMin = Number.isFinite(min) ? min : 0;
  const safeMax = Number.isFinite(max) ? max : safeMin;
  const lower = Math.min(safeMin, safeMax);
  const upper = Math.max(safeMin, safeMax);
  if (lower === upper) return 0;
  const clamped = clamp(value, lower, upper);
  return (clamped - lower) / (upper - lower);
}

/** Normalizes an unknown value to a finite number, returning fallback if non-finite. */
export function toFiniteNumber(val: unknown, fallback = 0): number {
  return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}

