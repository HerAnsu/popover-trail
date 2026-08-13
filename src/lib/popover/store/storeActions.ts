/**
 * Pure Action State Reducers and Predicates for popover-trail store.
 * Encapsulates state transitions into pure, 100% testable functions following the Step-Down Rule.
 *
 * @module storeActions
 */

import type { PopoverStore, StatePatch } from '../types';
import { togglePinState } from './reducers/pinReducers';

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
  rect?: DOMRect,
): StatePatch<TData, TContext, TPopoverKey> {
  return togglePinState(state, key, rect);
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
