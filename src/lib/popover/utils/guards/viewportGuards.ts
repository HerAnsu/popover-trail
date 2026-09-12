/**
 * Viewport Coordinates & DOM Rect Normalizer Guards.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/viewportGuards
 */

import { isFiniteNumber } from './numberGuards';
export { toViewportX, toViewportY } from '../brandedNumbers';

/**
 * Safely extracts a numeric pixel value from a CSS style property (number or string with 'px').
 */
export function extractNumericStyle(val: unknown): number {
  if (typeof val === 'number') return Number.isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    const parsed = Number.parseFloat(val);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Assertion function verifying that `value` matches the `DOMRect` interface.
 */
export function assertIsDOMRect(value: unknown): asserts value is DOMRect {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('width' in value) ||
    !('height' in value) ||
    !isFiniteNumber(value.width) ||
    !isFiniteNumber(value.height)
  ) {
    throw new TypeError(
      `Expected DOMRect object with finite dimensions, received: ${typeof value}`,
    );
  }
}
