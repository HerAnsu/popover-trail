/**
 * DOM Sanitization and Measurement Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/domUtils
 */

import { toFiniteNumber } from './styles';

/**
 * Sanitizes a raw bounding rectangle object, replacing NaN or non-finite values with 0.
 *
 * @param rawRect - Potential rectangle candidate with x, y, width, height.
 * @returns Conforming DOMRect instance, or null if input was null/undefined.
 *
 * @example
 * ```typescript
 * const rect = sanitizeRect({ x: 10, y: NaN, width: 200, height: 100 });
 * console.log(rect?.y); // 0
 * ```
 */
export function sanitizeRect(
  rawRect: { x?: number; y?: number; width?: number; height?: number } | null | undefined,
): DOMRect | null {
  if (!rawRect) return null;
  const { x, y, width, height } = rawRect;
  return new DOMRect(
    toFiniteNumber(x),
    toFiniteNumber(y),
    toFiniteNumber(width),
    toFiniteNumber(height),
  );
}
