/**
 * Smart Constructors and Runtime Invariant Validation for Branded Numbers.
 *
 * @module utils/brandedNumbers
 */

import {
  type DurationMs,
  type TimestampMs,
  type ViewportX,
  type ViewportY,
  type ZIndexDepth,
  createBrand,
} from '../types/branded';

/**
 * Smart constructor for `DurationMs`.
 * Validates that the duration is a finite, non-negative number.
 *
 * @param ms - Raw duration in milliseconds.
 * @returns Validated DurationMs brand.
 */
export function toDurationMs(ms: number): DurationMs {
  const safe = Number.isFinite(ms) && ms >= 0 ? ms : 0;
  return createBrand<number, 'DurationMs'>(safe);
}

/**
 * Smart constructor for `TimestampMs`.
 * Validates that the timestamp is a finite number (defaults to Date.now()).
 *
 * @param ts - Optional raw timestamp in milliseconds.
 * @returns Validated TimestampMs brand.
 */
export function toTimestampMs(ts?: number): TimestampMs {
  const safe = typeof ts === 'number' && Number.isFinite(ts) ? ts : Date.now();
  return createBrand<number, 'TimestampMs'>(safe);
}

/**
 * Smart constructor for `ZIndexDepth`.
 * Validates that the z-index depth is a non-negative integer.
 *
 * @param depth - Raw depth number.
 * @returns Validated ZIndexDepth brand.
 */
export function toZIndexDepth(depth: number): ZIndexDepth {
  const safe = Number.isFinite(depth) && depth >= 0 ? Math.floor(depth) : 0;
  return createBrand<number, 'ZIndexDepth'>(safe);
}

/**
 * Smart constructor for `ViewportX`.
 * Validates that the x-coordinate is a finite number, sanitizing non-finite values to 0.
 *
 * @param x - Raw horizontal viewport coordinate.
 * @returns Validated ViewportX brand.
 */
export function toViewportX(x: number): ViewportX {
  const safe = Number.isFinite(x) ? x : 0;
  return createBrand<number, 'ViewportX'>(safe);
}

/**
 * Smart constructor for `ViewportY`.
 * Validates that the y-coordinate is a finite number, sanitizing non-finite values to 0.
 *
 * @param y - Raw vertical viewport coordinate.
 * @returns Validated ViewportY brand.
 */
export function toViewportY(y: number): ViewportY {
  const safe = Number.isFinite(y) ? y : 0;
  return createBrand<number, 'ViewportY'>(safe);
}

