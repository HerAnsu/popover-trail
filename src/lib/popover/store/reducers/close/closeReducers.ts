/**
 * Close and Hierarchy Cleanup State Reducers for popover-trail store.
 *
 * @module store/reducers/close/closeReducers
 */

import type { PopoverStateData, StatePatch } from '../../../types';
import { EMPTY_OBJECT } from '../../storeDefaults';
import type { PopoverDAG } from '../../../utils/dag';
import { getCleanupStatePatch, findUnifiedEntryIndex } from '../stack';
import { getRemovedKeysForClose } from './closeCalculation';
import { filterRetainedEntries } from './closeFilter';

export { getRemovedKeysForClose } from './closeCalculation';

/**
 * Pure state reducer computing next state when closing popover cards from a target index.
 */
export function closeFromState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  index: number,
  dag?: PopoverDAG<TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  const closeInfo = getRemovedKeysForClose(
    state.floating,
    state.trail,
    index,
    state.closePinnedDescendants,
    state.pinnedStates,
    dag,
  );

  if (!closeInfo || closeInfo.removedKeys.size === 0) return EMPTY_OBJECT;

  const { removedKeys } = closeInfo;
  const nextFloating = filterRetainedEntries(state.floating, removedKeys);
  const nextTrail = filterRetainedEntries(state.trail, removedKeys);

  const cleanupPatch = getCleanupStatePatch<TData, TContext, TPopoverKey>(
    nextFloating,
    nextTrail,
    state.offsets,
    state.zIndexOrder,
    state.pinnedStates,
    state.nestedHydrationRequestCounters,
  );

  return {
    floating: nextFloating,
    trail: nextTrail,
    ...cleanupPatch,
  };
}

/**
 * Direct key-addressed pure reducer for closing a popover card.
 */
export function closeByTargetKeyState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  targetKey: TPopoverKey,
  dag?: PopoverDAG<TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  const unifiedIndex = findUnifiedEntryIndex(state.floating, state.trail, targetKey);
  if (unifiedIndex === -1) return EMPTY_OBJECT;
  return closeFromState(state, unifiedIndex, dag);
}
