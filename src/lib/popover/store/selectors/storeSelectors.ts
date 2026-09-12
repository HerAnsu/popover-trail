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

export const selectActiveTrail = <TData = unknown, TPopoverKey extends string = string>(state: {
  trail: readonly TrailEntry<TData, TPopoverKey>[];
}): readonly TrailEntry<TData, TPopoverKey>[] => state.trail;

export const selectFloatingPopovers = <
  TData = unknown,
  TPopoverKey extends string = string,
>(state: {
  floating: readonly TrailEntry<TData, TPopoverKey>[];
}): readonly TrailEntry<TData, TPopoverKey>[] => state.floating;

export const selectFloatingEntries = selectFloatingPopovers;

export const selectTotalActiveCount = (state: {
  trail: readonly unknown[];
  floating: readonly unknown[];
}): number => state.trail.length + state.floating.length;

export const selectIsIdle = (state: {
  trail: readonly unknown[];
  floating: readonly unknown[];
}): boolean => state.trail.length === 0 && state.floating.length === 0;

export const selectAllOffsets = (state: {
  offsets: Record<string, DragOffset>;
}): Record<string, DragOffset> => state.offsets;

export type StoreSelectorMapper<
  TData = unknown,
  TContext = unknown,
  TResult = unknown,
  TPopoverKey extends string = string,
> = (state: PopoverStore<TData, TContext, TPopoverKey>) => TResult;

export function createTypedStoreSelector<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>() {
  return <TSelected>(selector: StoreSelectorMapper<TData, TContext, TSelected, TPopoverKey>) =>
    selector;
}
