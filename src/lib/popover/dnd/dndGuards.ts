/**
 * Type Guards for Drag-and-Drop (DND) Geometry, Bounding Boxes, and Features.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module dnd/dndGuards
 */

import type { Transform2D, NodeRect, BoundsRect, PopoverCardFeatures } from './dndTypes';
import { isPlainObject } from '../utils/guards/objectGuards';

/** Validates whether an unknown value conforms to Transform2D with finite numbers. */
export function isTransform2D(val: unknown): val is Transform2D {
  return (
    isPlainObject(val) &&
    typeof val.x === 'number' &&
    Number.isFinite(val.x) &&
    typeof val.y === 'number' &&
    Number.isFinite(val.y) &&
    typeof val.scaleX === 'number' &&
    Number.isFinite(val.scaleX) &&
    typeof val.scaleY === 'number' &&
    Number.isFinite(val.scaleY)
  );
}

/** Validates whether an unknown value conforms to NodeRect with non-negative dimensions. */
export function isNodeRect(val: unknown): val is NodeRect {
  return (
    isPlainObject(val) &&
    typeof val.left === 'number' &&
    Number.isFinite(val.left) &&
    typeof val.top === 'number' &&
    Number.isFinite(val.top) &&
    typeof val.width === 'number' &&
    Number.isFinite(val.width) &&
    val.width >= 0 &&
    typeof val.height === 'number' &&
    Number.isFinite(val.height) &&
    val.height >= 0
  );
}

/** Validates whether an unknown value conforms to BoundsRect with right >= left and bottom >= top. */
export function isBoundsRect(val: unknown): val is BoundsRect {
  return (
    isPlainObject(val) &&
    typeof val.left === 'number' &&
    Number.isFinite(val.left) &&
    typeof val.top === 'number' &&
    Number.isFinite(val.top) &&
    typeof val.right === 'number' &&
    Number.isFinite(val.right) &&
    val.right >= val.left &&
    typeof val.bottom === 'number' &&
    Number.isFinite(val.bottom) &&
    val.bottom >= val.top
  );
}

/** Validates whether an unknown value conforms to PopoverCardFeatures. */
export function isPopoverCardFeatures(val: unknown): val is PopoverCardFeatures {
  return isPlainObject(val);
}
