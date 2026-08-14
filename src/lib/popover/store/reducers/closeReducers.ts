/**
 * Close and Hierarchy Cleanup State Reducers for popover-trail store.
 * Decomposed following Clean Code guidelines (Single Responsibility, Step-Down Rule).
 *
 * @module store/reducers/closeReducers
 */

import type { TrailEntry, PopoverStateData } from '../../types';
import { getAllDescendants, getCleanupStatePatch } from './stackReducers';

/**
 * Helper extracting direct popover keys slated for closure based on index position.
 */
function getDirectClosedKeys<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  index: number,
  isFloating: boolean,
): string[] {
  if (isFloating) {
    const entry = floating[index];
    return entry ? [entry.key] : [];
  }
  const trailIndex = index - floating.length;
  return trail.slice(trailIndex).map((e) => e.key);
}

function shouldIncludeDescendant(
  key: string,
  closePinnedDescendants: boolean,
  pinnedStates?: Record<string, boolean>,
  floatingSet?: Set<string>,
): boolean {
  if (closePinnedDescendants) return true;
  if (pinnedStates) return !pinnedStates[key];
  if (floatingSet) return !floatingSet.has(key);
  return true;
}

/**
 * Helper resolving full set of closed keys including child descendants.
 */
function resolveAllRemovedKeys<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  directClosedKeys: string[],
  closePinnedDescendants: boolean,
  pinnedStates?: Record<string, boolean>,
): Set<string> {
  const result = new Set<string>(directClosedKeys);
  const descendants = getAllDescendants(directClosedKeys, floating, trail);
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
 * Pure state updater for closing popovers starting at a target virtual index.
 */
export function closeFromState<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  index: number,
): Partial<PopoverStateData<TData, TContext>> {
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
  );

  const nextFloating = state.floating.filter((e) => !removedKeys.has(e.key));
  const nextTrail = state.trail.filter((e) => !removedKeys.has(e.key));

  const nextPinnedStates = { ...state.pinnedStates };
  for (const key of removedKeys) {
    nextPinnedStates[key] = false;
  }

  const cleanupPatch = getCleanupStatePatch<TData, TContext>(
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
export function getRemovedKeysForClose<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  index: number,
  closePinnedDescendants: boolean,
  pinnedStates?: Record<string, boolean>,
): { isFloating: boolean; removedKeys: Set<string> } | null {
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
  );

  return {
    isFloating,
    removedKeys,
  };
}
