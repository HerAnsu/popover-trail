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
  if (!isPlainObject(val)) return false;
  const { x, y, scaleX, scaleY } = val as Partial<Transform2D>;
  return (
    typeof x === 'number' &&
    Number.isFinite(x) &&
    typeof y === 'number' &&
    Number.isFinite(y) &&
    typeof scaleX === 'number' &&
    Number.isFinite(scaleX) &&
    typeof scaleY === 'number' &&
    Number.isFinite(scaleY)
  );
}

/** Validates whether an unknown value conforms to NodeRect with non-negative dimensions. */
export function isNodeRect(val: unknown): val is NodeRect {
  if (!isPlainObject(val)) return false;
  const { left, top, width, height } = val as Partial<NodeRect>;
  return (
    typeof left === 'number' &&
    Number.isFinite(left) &&
    typeof top === 'number' &&
    Number.isFinite(top) &&
    typeof width === 'number' &&
    Number.isFinite(width) &&
    width >= 0 &&
    typeof height === 'number' &&
    Number.isFinite(height) &&
    height >= 0
  );
}

/** Validates whether an unknown value conforms to BoundsRect with right >= left and bottom >= top. */
export function isBoundsRect(val: unknown): val is BoundsRect {
  if (!isPlainObject(val)) return false;
  const { left, top, right, bottom } = val as Partial<BoundsRect>;
  return (
    typeof left === 'number' &&
    Number.isFinite(left) &&
    typeof top === 'number' &&
    Number.isFinite(top) &&
    typeof right === 'number' &&
    Number.isFinite(right) &&
    right >= left &&
    typeof bottom === 'number' &&
    Number.isFinite(bottom) &&
    bottom >= top
  );
}

/** Validates whether an unknown value conforms to PopoverCardFeatures. */
export function isPopoverCardFeatures(val: unknown): val is PopoverCardFeatures {
  return isPlainObject(val);
}
