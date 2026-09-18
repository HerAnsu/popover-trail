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
import { EMPTY_OBJECT, ZERO_OFFSET } from '../../storeDefaults';
import { omitKey } from '../../../utils/cleanObject';
import { getCleanupStatePatch, filterOutEntry, elevateKeyInOrder } from '../stack';
import { toFloatingEntry, toTrailEntry } from './pinGeometry';

/**
 * Transforms a cascading trail card into a modeless floating pinned card.
 *
 * @example
 * ```ts
 * const patch = pinTrailEntry(state, 'card-1', 0, cardBoundingRect);
 * store.setState(patch);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Valid popover key union.
 * @param state - Current popover store state data.
 * @param key - Popover key to pin.
 * @param trailIndex - Index of the key within the active trail array.
 * @param rect - Optional active bounding rect captured at pinning.
 * @returns State patch moving the card from trail to floating.
 */
export function pinTrailEntry<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  trailIndex: number,
  rect?: DOMRect | PopoverRect | null,
): StatePatch<TData, TContext, TPopoverKey> {
  const {
    trail,
    floating,
    offsets,
    pinnedStates,
    zIndexOrder,
    nestedHydrationRequestCounters,
  } = state;
  const entry = trail[trailIndex];
  if (!entry) return EMPTY_OBJECT;

  const nextTrail = filterOutEntry(trail, key);
  const nextFloating: TrailEntry<TData, TPopoverKey>[] = [
    ...floating,
    toFloatingEntry(entry, rect),
  ];
  const nextOffsets: Partial<Record<TPopoverKey, DragOffset>> = {
    ...offsets,
    [key]: ZERO_OFFSET,
  };

  const nextPinned: Partial<Record<TPopoverKey, boolean>> = { ...pinnedStates, [key]: true };
  const nextZIndexOrder = elevateKeyInOrder(zIndexOrder, key);

  const cleanupPatch = getCleanupStatePatch<TData, TContext, TPopoverKey>(
    nextFloating,
    nextTrail,
    nextOffsets,
    nextZIndexOrder,
    nextPinned,
    nestedHydrationRequestCounters ?? EMPTY_OBJECT,
  );

  return { floating: nextFloating, trail: nextTrail, ...cleanupPatch };
}

/**
 * Reverts a floating pinned card back into a cascading trail card.
 *
 * @example
 * ```ts
 * const patch = unpinFloatingEntry(state, 'card-1', 0);
 * store.setState(patch);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Valid popover key union.
 * @param state - Current popover store state data.
 * @param key - Popover key to unpin.
 * @param floatingIndex - Index of the key within the floating array.
 * @returns State patch moving the card from floating back to trail.
 */
export function unpinFloatingEntry<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  floatingIndex: number,
): StatePatch<TData, TContext, TPopoverKey> {
  const {
    floating,
    trail,
    offsets,
    pinnedStates,
    zIndexOrder,
    nestedHydrationRequestCounters,
  } = state;
  const entry = floating[floatingIndex];
  if (!entry) return EMPTY_OBJECT;

  const nextFloating = filterOutEntry(floating, key);
  const nextTrail: TrailEntry<TData, TPopoverKey>[] = [...trail, toTrailEntry(entry)];
  const nextOffsets = omitKey(offsets, key);
  const nextPinned: Partial<Record<TPopoverKey, boolean>> = { ...pinnedStates, [key]: false };

  const cleanupPatch = getCleanupStatePatch<TData, TContext, TPopoverKey>(
    nextFloating,
    nextTrail,
    nextOffsets,
    zIndexOrder,
    nextPinned,
    nestedHydrationRequestCounters ?? EMPTY_OBJECT,
  );

  return { floating: nextFloating, trail: nextTrail, ...cleanupPatch };
}
