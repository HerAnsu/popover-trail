/**
 * Type Guards for Domain Value Objects.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/valueObjectGuards
 */

import { ZIndex, DurationMs } from '../domainValues';
import { Point2D } from '../Point2D';
import { RectBounds } from '../RectBounds';
import { isObjectRecord } from './objectGuards';

/**
 * Validates that an unknown candidate is a ZIndex value object instance.
 */
export function isZIndex(val: unknown): val is ZIndex {
  if (val instanceof ZIndex) return true;
  if (!isObjectRecord(val)) return false;
  return typeof val.value === 'number' && typeof val.elevate === 'function';
}

/**
 * Validates that an unknown candidate is a DurationMs value object instance.
 */
export function isDurationMs(val: unknown): val is DurationMs {
  if (val instanceof DurationMs) return true;
  if (!isObjectRecord(val)) return false;
  return typeof val.value === 'number' && val.constructor === DurationMs;
}

/**
 * Validates that an unknown candidate is a Point2D class instance.
 */
export function isPoint2DInstance(val: unknown): val is Point2D {
  if (val instanceof Point2D) return true;
  if (!isObjectRecord(val)) return false;
  return (
    typeof val.x === 'number' && typeof val.y === 'number' && typeof val.distanceTo === 'function'
  );
}

/**
 * Validates that an unknown candidate is a RectBounds class instance.
 */
export function isRectBoundsInstance(val: unknown): val is RectBounds {
  if (val instanceof RectBounds) return true;
  if (!isObjectRecord(val)) return false;
  return (
    typeof val.top === 'number' &&
    typeof val.left === 'number' &&
    typeof val.width === 'number' &&
    typeof val.height === 'number' &&
    typeof val.contains === 'function'
  );
}
