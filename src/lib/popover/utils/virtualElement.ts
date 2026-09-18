/**
 * VirtualElement and Synthetic DOMRect Geometry Factory.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/virtualElement
 */

import type { AnchorEventLike } from '../types/storeStateTypes';
import { toFiniteNumber } from './math';

/**
 * Creates a safe zero-dimension fallback DOMRect instance.
 *
 * @returns Standard DOMRect or conforming fallback object.
 *
 * @example
 * ```typescript
 * const rect = createDefaultDOMRect();
 * console.log(rect.width); // 0
 * ```
 */
export function createDefaultDOMRect(): DOMRect {
  if (typeof DOMRect !== 'undefined') return new DOMRect(0, 0, 0, 0);
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    toJSON: () => ({}),
  };
}

/**
 * Factory helper creating a VirtualElement / AnchorEventLike object from coordinates.
 *
 * Useful for anchoring floating popovers to arbitrary pointer clicks or virtual coordinates
 * without requiring an actual DOM element.
 *
 * @param x - Horizontal coordinate in pixels.
 * @param y - Vertical coordinate in pixels.
 * @param width - Optional width bounding box (default: 0).
 * @param height - Optional height bounding box (default: 0).
 * @returns Virtual anchor object with `getBoundingClientRect()`.
 *
 * @example
 * ```typescript
 * const virtualAnchor = createVirtualElement(event.clientX, event.clientY);
 * openPopover('context-menu', { anchor: virtualAnchor });
 * ```
 */
export function createVirtualElement(
  x: number,
  y: number,
  width = 0,
  height = 0,
): AnchorEventLike & { getBoundingClientRect: () => DOMRect } {
  const safeX = toFiniteNumber(x);
  const safeY = toFiniteNumber(y);
  const safeWidth = Math.max(0, toFiniteNumber(width));
  const safeHeight = Math.max(0, toFiniteNumber(height));

  const rectData = {
    x: safeX,
    y: safeY,
    left: safeX,
    top: safeY,
    right: safeX + safeWidth,
    bottom: safeY + safeHeight,
    width: safeWidth,
    height: safeHeight,
    toJSON: () => ({ ...rectData }),
  };
  return { getBoundingClientRect: () => rectData };
}

/**
 * Normalizes any DOMRect-like or ClientRect object into a conforming DOMRect.
 *
 * Sanitizes non-finite coordinates, computes missing `right` and `bottom` boundaries,
 * and ensures negative dimensions are clamped to 0.
 *
 * @param rect - Target rectangle candidate.
 * @returns Conforming DOMRect object.
 *
 * @example
 * ```typescript
 * const safeRect = normalizeDOMRect({ top: 10, left: 20, width: 100, height: 50 });
 * console.log(safeRect.right); // 120
 * ```
 */
export function normalizeDOMRect(
  rect?: {
    top: number;
    left: number;
    width: number;
    height: number;
    right?: number;
    bottom?: number;
    x?: number;
    y?: number;
  } | null,
): DOMRect {
  if (!rect) return createDefaultDOMRect();
  if (typeof DOMRect !== 'undefined' && rect instanceof DOMRect) return rect;
  const top = toFiniteNumber(rect.top);
  const left = toFiniteNumber(rect.left);
  const width = Math.max(0, toFiniteNumber(rect.width));
  const height = Math.max(0, toFiniteNumber(rect.height));
  return {
    top,
    left,
    width,
    height,
    right: rect.right ?? left + width,
    bottom: rect.bottom ?? top + height,
    x: rect.x ?? left,
    y: rect.y ?? top,
    toJSON: () => ({}),
  };
}
