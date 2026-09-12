import {
  areCoordinatesWithinBounds,
  isNonEmptyString,
  isPositiveFinite,
} from '../utils/typeGuards';
import { isDevEnv, PopoverWarningCode, warnDevDetails } from './warningEngine';

/** PT-114: Validates drag offset coordinates. */
export function validateDragOffset(x: number, y: number): void {
  if (!isDevEnv()) return;

  if (!areCoordinatesWithinBounds(x, y, 10000)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_DRAG_OFFSET,
      message: `Invalid drag offset coordinates (${x}, ${y}) received. Offsets must be valid numbers within [-10000, 10000].`,
    });
  }
}

/** PT-116: Validates stack group filter string. */
export function validateStackGroup(stackGroup: string | null | undefined): void {
  if (!isDevEnv() || stackGroup === null || stackGroup === undefined) return;

  if (!isNonEmptyString(stackGroup)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_STACK_GROUP,
      message: 'Stack group ID filter is an empty string or whitespace.',
    });
  }
}

/** PT-121: Validates pin drag state logic. */
export function validatePinDragState(isPinned: boolean, allowDragWhenUnpinned?: boolean): void {
  if (!isDevEnv()) return;

  if (!isPinned && allowDragWhenUnpinned === false) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_PIN_DRAG_STATE,
      message: 'Drag action attempted on an unpinned popover card that disables unpinned dragging.',
    });
  }
}

/** PT-123: Validates QuadTree spatial bounding box dimensions. */
export function validateQuadTreeBounds(width: number, height: number): void {
  if (!isDevEnv()) return;

  if (!isPositiveFinite(width) || !isPositiveFinite(height)) {
    warnDevDetails(true, {
      code: PopoverWarningCode.INVALID_QUADTREE_BOUNDS,
      message: `QuadTree spatial index received invalid non-positive dimensions (${width}x${height}).`,
    });
  }
}
