import {
  areCoordinatesWithinBounds,
  isNonEmptyString,
  isPositiveFinite,
} from '../utils/typeGuards';
import type { Maybe } from '../types/utilityTypes';
import { isDevEnv, PopoverWarningCode, warnDevDetails } from './warningEngine';

/**
 * Validates drag offset coordinate values to prevent non-finite or extreme out-of-screen values.
 * Emits dev warning `PT-114` if coordinates fall outside [-10000, 10000].
 *
 * @param x - Horizontal offset in pixels.
 * @param y - Vertical offset in pixels.
 *
 * @example
 * ```typescript
 * validateDragOffset(120, -50); // Valid
 * validateDragOffset(50000, 0); // Emits PT-114 warning in development
 * ```
 */
export function validateDragOffset(x: number, y: number): void {
  if (!isDevEnv()) return;

  if (!areCoordinatesWithinBounds(x, y, 10000)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_DRAG_OFFSET,
      message: `Invalid drag offset coordinates (${x}, ${y}) received. Offsets must be valid numbers within [-10000, 10000].`,
    });
  }
}

/**
 * Validates stack group identifier string.
 * Emits dev warning `PT-116` if group is provided but empty or whitespace.
 *
 * @param stackGroup - Optional stack group identifier.
 *
 * @example
 * ```typescript
 * validateStackGroup('modal-stack'); // Valid
 * validateStackGroup('   '); // Emits PT-116 warning in development
 * ```
 */
export function validateStackGroup(stackGroup: Maybe<string>): void {
  if (!isDevEnv() || stackGroup === null || stackGroup === undefined) return;

  if (!isNonEmptyString(stackGroup)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_STACK_GROUP,
      message: 'Stack group ID filter is an empty string or whitespace.',
    });
  }
}

/**
 * Validates drag attempt state when card is unpinned.
 * Emits dev warning `PT-121` if dragging is initiated on an unpinned card with `allowDragWhenUnpinned === false`.
 *
 * @param isPinned - Whether card is pinned.
 * @param allowDragWhenUnpinned - Whether unpinned drag is allowed.
 *
 * @example
 * ```typescript
 * validatePinDragState(false, false); // Emits PT-121 warning in development
 * ```
 */
export function validatePinDragState(isPinned: boolean, allowDragWhenUnpinned?: boolean): void {
  if (!isDevEnv()) return;

  if (!isPinned && allowDragWhenUnpinned === false) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_PIN_DRAG_STATE,
      message: 'Drag action attempted on an unpinned popover card that disables unpinned dragging.',
    });
  }
}

/**
 * Validates QuadTree spatial indexing dimensions.
 * Emits dev warning `PT-123` if width or height is non-positive or non-finite.
 *
 * @param width - Bounding box width in pixels.
 * @param height - Bounding box height in pixels.
 *
 * @example
 * ```typescript
 * validateQuadTreeBounds(1920, 1080); // Valid
 * validateQuadTreeBounds(-100, 500); // Emits PT-123 warning in development
 * ```
 */
export function validateQuadTreeBounds(width: number, height: number): void {
  if (!isDevEnv()) return;

  if (!isPositiveFinite(width) || !isPositiveFinite(height)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_QUADTREE_BOUNDS,
      message: `QuadTree spatial index received invalid non-positive dimensions (${width}x${height}).`,
    });
  }
}
