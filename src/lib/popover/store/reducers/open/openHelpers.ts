/**
 * Trail State Assembly and Calculation Helpers for Popover Open Reducers.
 *
 * @module store/reducers/open/openHelpers
 */

import type { PopoverStateData, StatePatch, TrailEntry } from '../../../types';
import { collectActiveStateSlices, getNextZIndexOrder } from '../stack';

export { computeNextTrailForNestedPush } from './nestedPush';

/**
 * Builds an active trail state patch, updating offsets, pinnedStates, hydration counters, and z-index order.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global application context.
 * @template TPopoverKey - Registered string key identifiers.
 * @param state - Current store state snapshot.
 * @param nextTrail - Candidate next trail list.
 * @param activeKey - Key of the entry being brought to focus / made active.
 * @param extraPatch - Optional extra patch fields (e.g. `ownerId`).
 * @returns Fully aggregated `StatePatch`.
 *
 * @example
 * ```typescript
 * const patch = buildActiveTrailPatch(state, nextTrail, 'card-1');
 * ```
 */
export function buildActiveTrailPatch<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  nextTrail: readonly TrailEntry<TData, TPopoverKey>[],
  activeKey: TPopoverKey,
  extraPatch?: StatePatch<TData, TContext, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  const { zIndexOrder } = state;
  const { activeKeys, nextOffsets, nextPinnedStates, nextCounters } = collectActiveStateSlices(
    state,
    nextTrail,
  );

  return {
    ...extraPatch,
    trail: nextTrail,
    offsets: nextOffsets,
    pinnedStates: nextPinnedStates,
    nestedHydrationRequestCounters: nextCounters,
    zIndexOrder: getNextZIndexOrder(zIndexOrder, activeKeys, activeKey),
  };
}
