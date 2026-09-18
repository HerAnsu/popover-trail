/**
 * Scoped State Mutation Helpers for Popover Cards.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module utils/controller/cardMutations
 */

import type { StoreApi } from 'zustand';
import type { PopoverStore } from '../../types';
import { selectIsPinned } from '../../store/selectors';
import { isPopoverActive, isKeyInList, isMatchingKey } from '../predicates';

/**
 * Updates the data payload of an active popover card in-place and clears its loading flag.
 *
 * @template TData - Payload data type.
 * @template TContext - Context type.
 * @template TPopoverKey - Popover key type.
 * @param store - Target Zustand store instance.
 * @param key - Identifier of the card to update.
 * @param data - New data payload.
 *
 * @example
 * ```typescript
 * updateCardData(store, 'profile-card', { name: 'Bob', role: 'admin' });
 * ```
 */
export function updateCardData<TData, TContext, TPopoverKey extends string>(
  store: StoreApi<PopoverStore<TData, TContext, TPopoverKey>>,
  key: TPopoverKey,
  data: TData,
): void {
  store.setState((state) => {
    if (!isPopoverActive(state, key)) return state;

    const matchesKey = isMatchingKey(key);
    const inFloating = isKeyInList(state.floating, key);
    const inTrail = isKeyInList(state.trail, key);

    return {
      floating: inFloating
        ? state.floating.map((e) => (matchesKey(e) ? { ...e, data, isLoading: false } : e))
        : state.floating,
      trail: inTrail
        ? state.trail.map((e) => (matchesKey(e) ? { ...e, data, isLoading: false } : e))
        : state.trail,
    };
  });
}

/**
 * Pins an active popover card if currently unpinned, preserving its screen coordinates.
 *
 * @template TData - Payload data type.
 * @template TContext - Context type.
 * @template TPopoverKey - Popover key type.
 * @param state - Store state instance.
 * @param key - Key of the card to pin.
 * @param rect - Optional DOMRect bounding coordinates.
 *
 * @example
 * ```typescript
 * pinCard(state, 'card-1', cardEl.getBoundingClientRect());
 * ```
 */
export function pinCard<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  rect?: DOMRect,
): void {
  if (!selectIsPinned<TPopoverKey>(key)(state)) {
    state.togglePin(key, rect);
  }
}

/**
 * Unpins an active popover card if currently pinned, returning it to cascade flow.
 *
 * @template TData - Payload data type.
 * @template TContext - Context type.
 * @template TPopoverKey - Popover key type.
 * @param state - Store state instance.
 * @param key - Key of the card to unpin.
 *
 * @example
 * ```typescript
 * unpinCard(state, 'card-1');
 * ```
 */
export function unpinCard<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
): void {
  if (selectIsPinned<TPopoverKey>(key)(state)) {
    state.togglePin(key);
  }
}

/**
 * Connects a directed edge in the DAG from `parentKey` to `childKey`.
 *
 * @template TData - Payload data type.
 * @template TContext - Context type.
 * @template TPopoverKey - Popover key type.
 * @param state - Store state instance.
 * @param childKey - Child node key.
 * @param parentKey - Parent node key.
 * @returns True if edge was added, false if rejected.
 *
 * @example
 * ```typescript
 * addCardParent(state, 'child-card', 'parent-card');
 * ```
 */
export function addCardParent<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  childKey: TPopoverKey,
  parentKey: TPopoverKey,
): boolean {
  return state.addEdge(parentKey, childKey);
}

/**
 * Disconnects a directed edge in the DAG between parent and child.
 *
 * @template TData - Payload data type.
 * @template TContext - Context type.
 * @template TPopoverKey - Popover key type.
 * @param state - Store state instance.
 * @param childKey - Child node key.
 * @param parentKey - Parent node key.
 *
 * @example
 * ```typescript
 * removeCardParent(state, 'child-card', 'parent-card');
 * ```
 */
export function removeCardParent<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  childKey: TPopoverKey,
  parentKey: TPopoverKey,
): void {
  state.removeEdge(parentKey, childKey);
}
