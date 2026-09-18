/**
 * Contravariant Query Selectors and Identity Maps for popover-trail store.
 *
 * @module storeSelectors
 */

import type { TrailEntry, DragOffset, PopoverStore } from '../../types';

export * from './storeSelectorTypes';
export * from './storeHierarchySelectors';
export * from './storeEntrySelectors';
export { ZERO_OFFSET } from '../hydration/storeDefaults';

/**
 * Selects the active cascading trail entries array.
 *
 * @example
 * ```ts
 * const trail = selectActiveTrail(store.getState());
 * console.log('Active trail length:', trail.length);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param state - State object with trail array.
 * @returns Readonly array of active trail entries.
 */
export const selectActiveTrail = <TData = unknown, TPopoverKey extends string = string>(state: {
  readonly trail: readonly TrailEntry<TData, TPopoverKey>[];
}): readonly TrailEntry<TData, TPopoverKey>[] => state.trail;

/**
 * Selects the array of floating (pinned) entries.
 *
 * @example
 * ```ts
 * const floating = selectFloatingEntries(store.getState());
 * console.log('Pinned popovers:', floating.map(e => e.key));
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param state - State object with floating array.
 * @returns Readonly array of floating/pinned entries.
 */
export const selectFloatingEntries = <
  TData = unknown,
  TPopoverKey extends string = string,
>(state: {
  readonly floating: readonly TrailEntry<TData, TPopoverKey>[];
}): readonly TrailEntry<TData, TPopoverKey>[] => state.floating;

/**
 * Computes the total number of currently active popovers (trail entries + floating entries).
 *
 * @example
 * ```ts
 * const totalOpen = selectTotalActiveCount(store.getState());
 * ```
 *
 * @param state - State object with trail and floating arrays.
 * @returns Total count of open popovers.
 */
export const selectTotalActiveCount = (state: {
  readonly trail: readonly unknown[];
  readonly floating: readonly unknown[];
}): number => state.trail.length + state.floating.length;

/**
 * Returns whether all popovers are closed (both trail and floating are empty).
 *
 * @example
 * ```ts
 * const idle = selectIsIdle(store.getState());
 * ```
 *
 * @param state - State object with trail and floating arrays.
 * @returns True if no popovers are open, false otherwise.
 */
export const selectIsIdle = (state: {
  readonly trail: readonly unknown[];
  readonly floating: readonly unknown[];
}): boolean => state.trail.length === 0 && state.floating.length === 0;

/**
 * Selects the dictionary mapping popover keys to custom 2D drag offsets.
 *
 * @example
 * ```ts
 * const offsets = selectAllOffsets(store.getState());
 * ```
 *
 * @param state - State object containing offsets dictionary.
 * @returns Dictionary of drag offsets.
 */
export const selectAllOffsets = (state: {
  readonly offsets: Record<string, DragOffset>;
}): Record<string, DragOffset> => state.offsets;

/**
 * Function mapping a complete PopoverStore state snapshot to a selected projection value.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global shared store context type.
 * @template TResult - Projected selector return value type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export type StoreSelectorMapper<
  TData = unknown,
  TContext = unknown,
  TResult = unknown,
  TPopoverKey extends string = string,
> = (state: PopoverStore<TData, TContext, TPopoverKey>) => TResult;

/**
 * Helper factory creating typed selectors bound to specific store generic parameter types.
 *
 * @example
 * ```ts
 * const createSelector = createTypedStoreSelector<UserData, AppContext, 'profile' | 'settings'>();
 * const mySelector = createSelector(state => state.trail.length);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @returns Curried helper to declare strongly-typed selector functions.
 */
export function createTypedStoreSelector<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>() {
  return <TSelected>(selector: StoreSelectorMapper<TData, TContext, TSelected, TPopoverKey>) =>
    selector;
}
