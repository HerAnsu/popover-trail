/**
 * VirtualElement and Synthetic DOMRect Geometry Factory.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/virtualElement
 */

import type { AnchorEventLike } from '../types/storeStateTypes';

/**
 * Creates a safe fallback DOMRect instance.
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
 */
export function createVirtualElement(
  x: number,
  y: number,
  width = 0,
  height = 0,
): AnchorEventLike & { getBoundingClientRect: () => DOMRect } {
  const safeX = Number.isFinite(x) ? x : 0;
  const safeY = Number.isFinite(y) ? y : 0;
  const safeWidth = Number.isFinite(width) ? Math.max(0, width) : 0;
  const safeHeight = Number.isFinite(height) ? Math.max(0, height) : 0;

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
  const top = Number.isFinite(rect.top) ? rect.top : 0;
  const left = Number.isFinite(rect.left) ? rect.left : 0;
  const width = Number.isFinite(rect.width) && rect.width >= 0 ? rect.width : 0;
  const height = Number.isFinite(rect.height) && rect.height >= 0 ? rect.height : 0;
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
