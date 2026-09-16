/**
 * Pin & Modeless Floating State Reducer for popover-trail store.
 *
 * @module store/reducers/pinning/pinReducers
 */

import type { PopoverStateData, StatePatch, DragOffset, PopoverRect } from '../../../types';
import { EMPTY_OBJECT } from '../../storeDefaults';
import { isDragOffsetEqual } from '../../../utils/dragMath';
import { isFinitePoint } from '../../../utils/typeGuards';
import { findEntryIndex } from '../stack';
import { pinTrailEntry, unpinFloatingEntry } from './pinOperations';

/**
 * Computes the state patch when updating the drag or docking offset for a popover card.
 *
 * @remarks
 * Validates finite float coordinates to prevent NaN or Infinite coordinate corruptions.
 * Checks for value equality (`isDragOffsetEqual`) to return `EMPTY_OBJECT` if unchanged,
 * preventing unnecessary store revisions or re-renders.
 *
 * @param state - Current store state snapshot.
 * @param key - Identifier of the dragged popover.
 * @param offset - New 2D drag offset coordinates `{ x, y }`.
 * @returns State patch with updated `offsets`, or empty object if coordinates are identical/invalid.
 */
export function updateOffsetState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  offset: DragOffset,
): StatePatch<TData, TContext, TPopoverKey> {
  if (!isFinitePoint(offset)) {
    return EMPTY_OBJECT;
  }
  const currentOffset = state.offsets[key];
  if (isDragOffsetEqual(currentOffset, offset)) {
    return EMPTY_OBJECT;
  }
  return {
    offsets: {
      ...state.offsets,
      [key]: offset,
    },
  };
}

/**
 * Computes the state patch when toggling a popover between floating (pinned) and cascade (trail) modes.
 *
 * @remarks
 * - If the card is currently floating/pinned, transitions it back into the active trail.
 * - If the card is currently in the active trail, detaches it into the pinned floating stack.
 *
 * @param state - Current store state snapshot.
 * @param key - Identifier of the popover to toggle.
 * @param rect - Optional bounding rectangle captured at the moment of pinning to preserve exact coordinates.
 * @returns State patch transitioning the card between floating and trail collections.
 */
export function togglePinState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  rect?: DOMRect | PopoverRect | null,
): StatePatch<TData, TContext, TPopoverKey> {
  const floatingIndex = findEntryIndex(state.floating, key);
  if (floatingIndex !== -1) {
    return unpinFloatingEntry(state, key, floatingIndex);
  }

  const trailIndex = findEntryIndex(state.trail, key);
  if (trailIndex !== -1) {
    return pinTrailEntry(state, key, trailIndex, rect);
  }

  return EMPTY_OBJECT;
}
