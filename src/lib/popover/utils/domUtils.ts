/**
 * DOM Sanitization and Measurement Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/domUtils
 */

import { toFiniteNumber } from './styles';

export function sanitizeRect(
  rawRect: { x?: number; y?: number; width?: number; height?: number } | null | undefined,
): DOMRect | null {
  if (!rawRect) return null;
  return new DOMRect(
    toFiniteNumber(rawRect.x),
    toFiniteNumber(rawRect.y),
    toFiniteNumber(rawRect.width),
    toFiniteNumber(rawRect.height),
  );
}
