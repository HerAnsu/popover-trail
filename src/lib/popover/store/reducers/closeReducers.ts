/**
 * Close and Hierarchy Cleanup State Reducers for popover-trail store.
 *
 * @module store/reducers/closeReducers
 */

import type { TrailEntry, PopoverStateData, StatePatch } from '../../types';
import { getAllDescendants, getCleanupStatePatch } from './stackReducers';
import type { PopoverDAG } from '../../utils/dag';

function getDirectClosedKeys<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  index: number,
  isFloating: boolean,
): TPopoverKey[] {
  if (isFloating) {
    const entry = floating[index];
    return entry ? [entry.key] : [];
  }
  const trailIndex = index - floating.length;
  return trail.slice(trailIndex).map((e) => e.key);
}

function shouldIncludeDescendant<TPopoverKey extends string = string>(
  key: TPopoverKey,
  closePinnedDescendants: boolean,
  pinnedStates?: Readonly<Partial<Record<TPopoverKey, boolean>>>,
  floatingSet?: Set<TPopoverKey>,
): boolean {
  if (closePinnedDescendants) return true;
  if (pinnedStates) return !pinnedStates[key];
  if (floatingSet) return !floatingSet.has(key);
  return true;
}

function resolveAllRemovedKeys<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  directClosedKeys: TPopoverKey[],
  closePinnedDescendants: boolean,
  pinnedStates?: Readonly<Partial<Record<TPopoverKey, boolean>>>,
  dag?: PopoverDAG<TPopoverKey>,
): Set<TPopoverKey> {
  const result = new Set<TPopoverKey>(directClosedKeys);
  const descendants = getAllDescendants<TData, TPopoverKey>(
    directClosedKeys,
    floating,
    trail,
    false,
    dag,
  );
  const floatingSet =
    !closePinnedDescendants && !pinnedStates && floating.length > 0
      ? new Set(floating.map((e) => e.key))
      : undefined;

  for (const key of descendants) {
    if (shouldIncludeDescendant(key, closePinnedDescendants, pinnedStates, floatingSet)) {
      result.add(key);
    }
  }

  return result;
}

/**
 * Pure state reducer computing next state when closing popover cards from a target index.
 */
export function closeFromState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  index: number,
  dag?: PopoverDAG<TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  const totalCount = state.floating.length + state.trail.length;
  if (index < 0 || index >= totalCount) return {};

  const isFloating = index < state.floating.length;
  const directClosedKeys = getDirectClosedKeys(state.floating, state.trail, index, isFloating);
  if (directClosedKeys.length === 0) return {};

  const removedKeys = resolveAllRemovedKeys(
    state.floating,
    state.trail,
    directClosedKeys,
    state.closePinnedDescendants,
    state.pinnedStates,
    dag,
  );

  const nextFloating = state.floating.filter((e) => !removedKeys.has(e.key));
  const nextTrail = state.trail.filter((e) => !removedKeys.has(e.key));

  const nextPinnedStates: Partial<Record<TPopoverKey, boolean>> = { ...state.pinnedStates };
  for (const key of removedKeys) {
    nextPinnedStates[key] = false;
  }

  const cleanupPatch = getCleanupStatePatch<TData, TContext, TPopoverKey>(
    nextFloating,
    nextTrail,
    state.offsets,
    state.zIndexOrder,
    nextPinnedStates,
    state.nestedHydrationRequestCounters,
  );

  return {
    floating: nextFloating,
    trail: nextTrail,
    ...cleanupPatch,
  };
}

/**
 * Computes the set of popover keys to remove when closing from a target index.
 */
export function getRemovedKeysForClose<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  index: number,
  closePinnedDescendants: boolean,
  pinnedStates?: Readonly<Partial<Record<TPopoverKey, boolean>>>,
  dag?: PopoverDAG<TPopoverKey>,
): { isFloating: boolean; removedKeys: Set<TPopoverKey> } | null {
  const totalCount = floating.length + trail.length;
  if (index < 0 || index >= totalCount) return null;

  const isFloating = index < floating.length;
  const directClosedKeys = getDirectClosedKeys(floating, trail, index, isFloating);
  const removedKeys = resolveAllRemovedKeys(
    floating,
    trail,
    directClosedKeys,
    closePinnedDescendants,
    pinnedStates,
    dag,
  );

  return {
    isFloating,
    removedKeys,
  };
}
