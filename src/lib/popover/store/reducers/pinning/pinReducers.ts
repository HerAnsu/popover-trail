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
 * Pure state reducer computing next state when updating drag coordinates for a popover card.
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
 * Pure state reducer computing next state when toggling between floating (pinned) and cascade (trail) modes.
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
