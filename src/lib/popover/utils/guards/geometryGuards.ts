/**
 * 2D Spatial Geometry & Finite Float Type Guards.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/geometryGuards
 */

import type { DragOffset, Point2D, PopoverRect } from '../../types/geometry';
import { isCoordinateWithinBounds, isFiniteNumber } from './numberGuards';

/**
 * Validates whether an unknown value conforms to a finite immutable PopoverRect.
 */
export function isPopoverRect(val: unknown): val is PopoverRect {
  if (typeof val !== 'object' || val === null) return false;
  return (
    'top' in val &&
    'left' in val &&
    'width' in val &&
    'height' in val &&
    isFiniteNumber(val.top) &&
    isFiniteNumber(val.left) &&
    isFiniteNumber(val.width) &&
    isFiniteNumber(val.height) &&
    val.width >= 0 &&
    val.height >= 0
  );
}

/**
 * Non-throwing type guard checking if an unknown value is a valid DOMRect instance or duck-type.
 */
export function isDOMRect(val: unknown): val is DOMRect {
  if (typeof DOMRect !== 'undefined' && val instanceof DOMRect) {
    return isFiniteNumber(val.width) && isFiniteNumber(val.height);
  }
  if (typeof val !== 'object' || val === null) return false;
  return (
    'x' in val &&
    'y' in val &&
    'width' in val &&
    'height' in val &&
    'top' in val &&
    'bottom' in val &&
    'left' in val &&
    'right' in val &&
    isFiniteNumber(val.x) &&
    isFiniteNumber(val.y) &&
    isFiniteNumber(val.width) &&
    isFiniteNumber(val.height) &&
    isFiniteNumber(val.top) &&
    isFiniteNumber(val.bottom) &&
    isFiniteNumber(val.left) &&
    isFiniteNumber(val.right)
  );
}

/**
 * Union type guard checking if a value is either a DOMRect or a PopoverRect.
 */
export function isDOMRectOrPopoverRect(val: unknown): val is DOMRect | PopoverRect {
  return isDOMRect(val) || isPopoverRect(val);
}

/**
 * Validates whether a value is an immutable 2D point with finite coordinates.
 */
export function isPoint2D(val: unknown): val is Point2D {
  if (typeof val !== 'object' || val === null) return false;
  return 'x' in val && 'y' in val && isFiniteNumber(val.x) && isFiniteNumber(val.y);
}

/**
 * Validates whether a value is a finite DragOffset within coordinate bounds.
 */
export function isDragOffset(val: unknown, limit = 10000): val is DragOffset {
  if (typeof val !== 'object' || val === null) return false;
  return (
    'x' in val &&
    'y' in val &&
    isCoordinateWithinBounds(val.x, limit) &&
    isCoordinateWithinBounds(val.y, limit)
  );
}
