/**
 * State Transition Operations for Pinning and Unpinning Popover Cards.
 *
 * @module store/reducers/pinning/pinOperations
 */

import type {
  PopoverStateData,
  StatePatch,
  DragOffset,
  TrailEntry,
  PopoverRect,
} from '../../../types';
import { EMPTY_OBJECT } from '../../storeDefaults';
import { omitRecordKey } from '../../../utils/cleanObject';
import { getCleanupStatePatch, filterOutEntryKey, elevateKeyInOrder } from '../stack';
import { toFloatingEntry, toTrailEntry } from './pinGeometry';

/**
 * Transforms a cascading trail card into a modeless floating pinned card.
 */
export function pinTrailEntry<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  trailIndex: number,
  rect?: DOMRect | PopoverRect | null,
): StatePatch<TData, TContext, TPopoverKey> {
  const entry = state.trail[trailIndex];
  if (!entry) return EMPTY_OBJECT;

  const nextTrail = filterOutEntryKey(state.trail, key);
  const nextFloating: TrailEntry<TData, TPopoverKey>[] = [
    ...state.floating,
    toFloatingEntry(entry, rect),
  ];
  const nextOffsets: Partial<Record<TPopoverKey, DragOffset>> = {
    ...state.offsets,
    [key]: { x: 0, y: 0 },
  };
  const nextPinned: Partial<Record<TPopoverKey, boolean>> = { ...state.pinnedStates, [key]: true };
  const nextZIndexOrder = elevateKeyInOrder(state.zIndexOrder, key);

  const cleanupPatch = getCleanupStatePatch<TData, TContext, TPopoverKey>(
    nextFloating,
    nextTrail,
    nextOffsets,
    nextZIndexOrder,
    nextPinned,
    state.nestedHydrationRequestCounters ?? EMPTY_OBJECT,
  );

  return { floating: nextFloating, trail: nextTrail, ...cleanupPatch };
}

/**
 * Reverts a floating pinned card back into a cascading trail card.
 */
export function unpinFloatingEntry<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  floatingIndex: number,
): StatePatch<TData, TContext, TPopoverKey> {
  const entry = state.floating[floatingIndex];
  if (!entry) return EMPTY_OBJECT;

  const nextFloating = filterOutEntryKey(state.floating, key);
  const nextTrail: TrailEntry<TData, TPopoverKey>[] = [...state.trail, toTrailEntry(entry)];
  const nextOffsets = omitRecordKey(state.offsets, key);
  const nextPinned: Partial<Record<TPopoverKey, boolean>> = { ...state.pinnedStates, [key]: false };

  const cleanupPatch = getCleanupStatePatch<TData, TContext, TPopoverKey>(
    nextFloating,
    nextTrail,
    nextOffsets,
    state.zIndexOrder,
    nextPinned,
    state.nestedHydrationRequestCounters ?? EMPTY_OBJECT,
  );

  return { floating: nextFloating, trail: nextTrail, ...cleanupPatch };
}
