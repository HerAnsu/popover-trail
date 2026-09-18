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
 * Validates whether an unknown value conforms to `PositionCoordinates` with finite numbers
 * and a valid floating-ui placement.
 *
 * @param val - Candidate value to evaluate.
 * @returns `true` if `val` is a valid `PositionCoordinates` object; `false` otherwise.
 *
 * @example
 * ```typescript
 * if (isPositionCoordinates(result)) {
 *   card.style.transform = `translate3d(${result.x}px, ${result.y}px, 0)`;
 * }
 * ```
 */
export function isPositionCoordinates(val: unknown): val is PositionCoordinates {
  if (!isPlainObject(val)) return false;
  const { x, y, placement } = val as Partial<PositionCoordinates>;

  return (
    typeof x === 'number' &&
    Number.isFinite(x) &&
    typeof y === 'number' &&
    Number.isFinite(y) &&
    isPopoverPlacement(placement)
  );
}

/**
 * Validates whether an unknown value conforms to `PositionComputeOptions`.
 *
 * @param val - Candidate value to evaluate.
 * @returns `true` if `val` is a valid `PositionComputeOptions` configuration object; `false` otherwise.
 *
 * @example
 * ```typescript
 * if (isPositionComputeOptions(options)) {
 *   const coords = await computePosition(anchor, card, options);
 * }
 * ```
 */
export function isPositionComputeOptions(val: unknown): val is PositionComputeOptions {
  if (!isPlainObject(val)) return false;
  const { placement, offset, flip, shift, autoPlacement } = val as Partial<PositionComputeOptions>;

  if (placement !== undefined && !isPopoverPlacement(placement)) return false;
  if (
    offset !== undefined &&
    (typeof offset !== 'number' || !Number.isFinite(offset))
  ) {
    return false;
  }
  if (flip !== undefined && typeof flip !== 'boolean') return false;
  if (shift !== undefined && typeof shift !== 'boolean') return false;
  if (autoPlacement !== undefined && typeof autoPlacement !== 'boolean') return false;

  return true;
}
