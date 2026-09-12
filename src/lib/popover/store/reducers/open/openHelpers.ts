/**
 * Trail State Assembly and Calculation Helpers for Popover Open Reducers.
 *
 * @module store/reducers/open/openHelpers
 */

import type { PopoverStateData, StatePatch, TrailEntry } from '../../../types';
import { collectActiveStateSlices, getNextZIndexOrder } from '../stack';

export { computeNextTrailForNestedPush } from './nestedPush';

/**
 * Builds an active trail state patch updating offsets, pinnedStates, counters, and z-index.
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
    zIndexOrder: getNextZIndexOrder(state.zIndexOrder, activeKeys, activeKey),
  };
}
