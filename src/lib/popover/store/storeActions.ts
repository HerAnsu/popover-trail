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
 *
 * @param pinnedStates - Record mapping popover keys to boolean pinned status.
 * @param key - Target popover key to check.
 * @returns True if the popover is pinned.
 */
export function isPinnedEntry(pinnedStates: Record<string, boolean>, key: string): boolean {
  return Boolean(pinnedStates[key]);
}

/**
 * Predicate checking if a key exists in the active z-index stacking order.
 *
 * @param zIndexOrder - Array of popover keys sorted in z-index order.
 * @param key - Target popover key to check.
 * @returns True if the key is present in the z-index stack.
 */
export function isKeyInZIndexOrder(zIndexOrder: readonly string[], key: string): boolean {
  return zIndexOrder.includes(key);
}

/**
 * Pure reducer function calculating state patch for toggling pin status on a popover entry.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Shared context payload type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param state - Current store state snapshot.
 * @param key - Popover key to toggle.
 * @param rect - Optional DOMRect capturing current screen coordinates for detaching.
 * @returns State patch object applying pin/unpin transition.
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
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Shared context payload type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param state - Current store state snapshot.
 * @param key - Popover key to update.
 * @param offset - Coordinate offset object with x and y pixel values.
 * @returns State patch object updating the offsets map.
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
