/**
 * Pure Action Predicates and Reducer Delegators for popover-trail store.
 *
 * @module storeActions
 */

import type { PopoverStateData, StatePatch } from '../types';
import { togglePinState, updateOffsetState } from './reducers/pinReducers';

/**
 * Predicate checking if a popover with the given key is currently pinned in state.
 */
export function isPinnedEntry(
  pinnedStates: Readonly<Partial<Record<string, boolean>>>,
  key: string,
): boolean {
  return Boolean(pinnedStates[key]);
}

/**
 * Predicate checking if a key exists in the active z-index stacking order.
 */
export function isKeyInZIndexOrder(zIndexOrder: readonly string[], key: string): boolean {
  return zIndexOrder.includes(key);
}

/**
 * Pure reducer delegator calculating state patch for toggling pin status.
 */
export function reduceTogglePinState<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  rect?: DOMRect,
): StatePatch<TData, TContext, TPopoverKey> {
  return togglePinState(state, key, rect);
}

/**
 * Pure reducer delegator updating drag offsets for a specific popover card.
 */
export function reduceUpdateOffsetState<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  offset: { x: number; y: number },
): StatePatch<TData, TContext, TPopoverKey> {
  return updateOffsetState(state, key, offset);
}
