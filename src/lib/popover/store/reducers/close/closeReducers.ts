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
import { filterRetainedEntries, omitRemovedRecordKeys } from './closeFilter';

export { getRemovedKeysForClose } from './closeCalculation';

/**
 * Computes the state patch when closing popover cards from a specific depth index.
 *
 * @remarks
 * Recursively calculates all keys to remove (including DAG reachable descendants),
 * filters retained floating and trail entries, and cleans up associated offsets,
 * pinned states, hydration counters, and z-index ordering.
 *
 * @param state - Current store state snapshot.
 * @param index - Unified index of the card to close.
 * @param dag - Optional DAG instance to identify hierarchical descendants.
 * @returns State patch with pruned entries and cleaned-up metadata.
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
    omitRemovedRecordKeys(state.offsets, removedKeys),
    state.zIndexOrder,
    omitRemovedRecordKeys(state.pinnedStates, removedKeys),
    omitRemovedRecordKeys(state.nestedHydrationRequestCounters, removedKeys),
  );

  return {
    floating: nextFloating,
    trail: nextTrail,
    ...cleanupPatch,
  };
}

/**
 * Computes the state patch for closing a popover card identified by key.
 *
 * @remarks
 * Finds the unified index of `targetKey` across floating and trail entries,
 * then delegates to {@link closeFromState} to remove the card and its cascade descendants.
 *
 * @param state - Current store state snapshot.
 * @param targetKey - Identifier of the popover card to close.
 * @param dag - Optional DAG instance to identify hierarchical descendants.
 * @returns State patch for the closure, or empty object if key was not found.
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
