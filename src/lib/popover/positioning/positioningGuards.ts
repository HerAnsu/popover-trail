/**
 * Type Guards for Floating Positioning Port Interfaces.
 * Clean Architecture Layer 1: Core Kernel (Interface Port).
 *
 * @module positioning/positioningGuards
 */

import type { PositionCoordinates, PositionComputeOptions } from './positioningAdapter';
import { isPopoverPlacement } from '../utils/guards/placementGuards';
import { isPlainObject } from '../utils/guards/objectGuards';

/**
 * Validates whether an unknown value conforms to PositionCoordinates with finite coordinates
 * and a valid floating-ui placement.
 */
export function isPositionCoordinates(val: unknown): val is PositionCoordinates {
  if (!isPlainObject(val)) return false;

  return (
    typeof val.x === 'number' &&
    Number.isFinite(val.x) &&
    typeof val.y === 'number' &&
    Number.isFinite(val.y) &&
    isPopoverPlacement(val.placement)
  );
}

/**
 * Validates whether an unknown value conforms to PositionComputeOptions.
 */
export function isPositionComputeOptions(val: unknown): val is PositionComputeOptions {
  if (!isPlainObject(val)) return false;

  if (val.placement !== undefined && !isPopoverPlacement(val.placement)) return false;
  if (
    val.offset !== undefined &&
    (typeof val.offset !== 'number' || !Number.isFinite(val.offset))
  ) {
    return false;
  }
  if (val.flip !== undefined && typeof val.flip !== 'boolean') return false;
  if (val.shift !== undefined && typeof val.shift !== 'boolean') return false;
  if (val.autoPlacement !== undefined && typeof val.autoPlacement !== 'boolean') return false;

  return true;
}
