/**
 * Active Slices Collection and Dangling State Cleanup Reducers for popover-trail.
 *
 * @module store/reducers/stack/stackActiveState
 */

import type { DragOffset, PopoverStateData, StatePatch, TrailEntry } from '../../../types';
import { EMPTY_ARRAY, emptyRecord } from '../../storeDefaults';
import { filterByAllowedKeys, getActiveKeys } from './recordFilter';

export interface ActiveStateSlices<TPopoverKey extends string = string> {
  readonly activeKeys: Set<TPopoverKey>;
  readonly nextOffsets: Readonly<Partial<Record<TPopoverKey, DragOffset>>>;
  readonly nextPinnedStates: Readonly<Partial<Record<TPopoverKey, boolean>>>;
  readonly nextCounters: Readonly<Partial<Record<TPopoverKey, number>>>;
}

function filterZIndexOrder<TPopoverKey extends string = string>(
  order: readonly TPopoverKey[],
  activeKeys: ReadonlySet<TPopoverKey>,
): readonly TPopoverKey[] {
  const isActive = (key: TPopoverKey) => activeKeys.has(key);
  if (order.every(isActive)) return order;

  const nextOrder = order.filter(isActive);
  return nextOrder.length === 0 ? EMPTY_ARRAY : nextOrder;
}


/**
 * Collects active state slices and synchronizes dictionary records with active keys.
 */
export function collectActiveStateSlices<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  nextTrail: readonly TrailEntry<TData, TPopoverKey>[],
): ActiveStateSlices<TPopoverKey> {
  const activeKeys = getActiveKeys(state.floating, nextTrail);
  const nextOffsets = filterByAllowedKeys<DragOffset, TPopoverKey>(state.offsets, activeKeys);
  const nextPinnedStates = filterByAllowedKeys<boolean, TPopoverKey>(state.pinnedStates, activeKeys);
  const nextCounters = filterByAllowedKeys<number, TPopoverKey>(
    state.nestedHydrationRequestCounters ?? emptyRecord(),
    activeKeys,
  );

  return { activeKeys, nextOffsets, nextPinnedStates, nextCounters };
}

/**
 * Computes dangling state cleanup patch filtering orphaned records.
 */
export function getCleanupStatePatch<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  nextFloating: readonly TrailEntry<TData, TPopoverKey>[],
  nextTrail: readonly TrailEntry<TData, TPopoverKey>[],
  offsets: Readonly<Partial<Record<TPopoverKey, DragOffset>>>,
  zIndexOrder: readonly TPopoverKey[],
  pinnedStates?: Readonly<Partial<Record<TPopoverKey, boolean>>>,
  counters?: Readonly<Partial<Record<TPopoverKey, number>>>,
): StatePatch<TData, TContext, TPopoverKey> {
  const activeKeys = getActiveKeys(nextFloating, nextTrail);
  const nextOffsets = filterByAllowedKeys<DragOffset, TPopoverKey>(offsets, activeKeys);
  const nextPinned = filterByAllowedKeys<boolean, TPopoverKey>(
    pinnedStates ?? emptyRecord<TPopoverKey, boolean>(),
    activeKeys,
  );
  const nextCounters = filterByAllowedKeys<number, TPopoverKey>(
    counters ?? emptyRecord<TPopoverKey, number>(),
    activeKeys,
  );
  const nextZ = filterZIndexOrder(zIndexOrder, activeKeys);

  return {
    offsets: nextOffsets,
    zIndexOrder: nextZ,
    pinnedStates: nextPinned,
    nestedHydrationRequestCounters: nextCounters,
    ...(nextTrail.length === 0 ? { anchorElement: null, anchorRect: null } : {}),
    ...(nextFloating.length === 0 && nextTrail.length === 0
      ? { zIndexOrder: EMPTY_ARRAY, ownerId: null }
      : {}),
  };
}
