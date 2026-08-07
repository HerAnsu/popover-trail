/**
 * Pure Action State Reducers and Predicates for popover-trail store.
 * Encapsulates state transitions into pure, 100% testable functions following the Step-Down Rule.
 *
 * @module storeActions
 */

import type { PopoverStore, StatePatch } from '../types';
import type { TrailEntry } from '../types/entryTypes';
import { bringToFrontPatch } from '../utils/storeHelpers';

/**
 * Predicate checking if a popover with the given key is currently pinned in state.
 */
export function isPinnedEntry(pinnedStates: Record<string, boolean>, key: string): boolean {
  return Boolean(pinnedStates[key]);
}

/**
 * Predicate checking if a key exists in the active z-index stacking order.
 */
export function isKeyInZIndexOrder(zIndexOrder: readonly string[], key: string): boolean {
  return zIndexOrder.includes(key);
}

/**
 * Helper locating an entry by key in either trail or floating lists.
 */
function findEntryInLists<TData>(
  state: { trail: readonly TrailEntry<TData>[]; floating: readonly TrailEntry<TData>[] },
  key: string,
): { targetEntry: TrailEntry<TData> | undefined; inTrail: boolean; inFloating: boolean } {
  const targetInTrail = state.trail.find((e) => e.key === key);
  const targetInFloating = state.floating.find((e) => e.key === key);
  return {
    targetEntry: targetInTrail ?? targetInFloating,
    inTrail: Boolean(targetInTrail),
    inFloating: Boolean(targetInFloating),
  };
}

/**
 * Helper partitioning trail and floating arrays upon toggling pin state.
 */
function partitionListsOnPinToggle<TData>(
  state: { trail: readonly TrailEntry<TData>[]; floating: readonly TrailEntry<TData>[] },
  key: string,
  nextPinState: boolean,
  inTrail: boolean,
  inFloating: boolean,
  targetEntry: TrailEntry<TData>,
): { nextTrail: readonly TrailEntry<TData>[]; nextFloating: readonly TrailEntry<TData>[] } {
  if (nextPinState && inTrail) {
    return {
      nextTrail: state.trail.filter((e) => e.key !== key),
      nextFloating: [...state.floating, targetEntry],
    };
  }
  if (!nextPinState && inFloating) {
    return {
      nextTrail: [...state.trail, targetEntry],
      nextFloating: state.floating.filter((e) => e.key !== key),
    };
  }
  return { nextTrail: state.trail, nextFloating: state.floating };
}

/**
 * Pure reducer function calculating state patch for toggling pin status on a popover entry.
 */
export function reduceTogglePinState<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: string,
): StatePatch<TData, TContext, TPopoverKey> {
  const nextPinState = !state.pinnedStates[key];
  const nextPinnedStates = { ...state.pinnedStates, [key]: nextPinState };

  const { targetEntry, inTrail, inFloating } = findEntryInLists(state, key);
  if (!targetEntry) {
    return { pinnedStates: nextPinnedStates };
  }

  const { nextTrail, nextFloating } = partitionListsOnPinToggle(
    state,
    key,
    nextPinState,
    inTrail,
    inFloating,
    targetEntry,
  );

  const bringToFrontState: PopoverStore<TData, TContext, TPopoverKey> = {
    ...state,
    trail: nextTrail,
    floating: nextFloating,
    pinnedStates: nextPinnedStates,
  };

  return {
    ...bringToFrontPatch(bringToFrontState, key),
    pinnedStates: nextPinnedStates,
  };
}

/**
 * Pure reducer function updating drag offsets for a specific popover card.
 */
export function reduceUpdateOffsetState<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: string,
  offset: { x: number; y: number },
): StatePatch<TData, TContext, TPopoverKey> {
  const currentOffset = state.offsets[key];
  if (currentOffset && currentOffset.x === offset.x && currentOffset.y === offset.y) {
    return {};
  }
  return {
    offsets: {
      ...state.offsets,
      [key]: offset,
    },
  };
}
