/**
 * Pure Action State Reducers and Predicates for popover-trail store.
 * Encapsulates state transitions into pure, 100% testable functions.
 *
 * @module storeActions
 */

import type { PopoverStore } from '../types';
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
 * Pure reducer function calculating state patch for toggling pin status on a popover entry.
 */
export function reduceTogglePinState<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: string,
): Partial<PopoverStore<TData, TContext, TPopoverKey>> {
  const currentPinState = Boolean(state.pinnedStates[key]);
  const nextPinState = !currentPinState;

  const nextPinnedStates = {
    ...state.pinnedStates,
    [key]: nextPinState,
  };

  const targetInTrail = state.trail.find((e) => e.key === key);
  const targetInFloating = state.floating.find((e) => e.key === key);
  const targetEntry = targetInTrail ?? targetInFloating;

  if (!targetEntry) {
    return { pinnedStates: nextPinnedStates };
  }

  let nextTrail = state.trail;
  let nextFloating = state.floating;

  if (nextPinState) {
    if (targetInTrail) {
      nextTrail = state.trail.filter((e) => e.key !== key);
      nextFloating = [...state.floating, targetEntry];
    }
  } else {
    if (targetInFloating) {
      nextFloating = state.floating.filter((e) => e.key !== key);
      nextTrail = [...state.trail, targetEntry];
    }
  }

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
): Partial<PopoverStore<TData, TContext, TPopoverKey>> {
  return {
    offsets: {
      ...state.offsets,
      [key]: offset,
    },
  };
}
