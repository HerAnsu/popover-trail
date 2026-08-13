/**
 * Pure Store Selectors for popover-trail.
 * Pure, memoizable state tree query functions operating on minimal sub-state slices.
 *
 * @module storeSelectors
 */

import type { TrailEntry } from '../types';
import { findEntryInStore, hasEntryWithKey } from '../utils/storeHelpers';

/**
 * Selects the active trailing popovers stack array.
 */
export function selectActiveTrail<TData = unknown>(state: {
  trail: readonly TrailEntry<TData>[];
}): readonly TrailEntry<TData>[] {
  return state.trail;
}

/**
 * Selects the active modeless pinned/floating popovers array.
 */
export function selectFloatingEntries<TData = unknown>(state: {
  floating: readonly TrailEntry<TData>[];
}): readonly TrailEntry<TData>[] {
  return state.floating;
}

/**
 * Selects a popover entry by its unique key ID across floating and trailing arrays.
 */
export function selectEntryByKey<TData = unknown>(key: string) {
  return (state: {
    floating: readonly TrailEntry<TData>[];
    trail: readonly TrailEntry<TData>[];
  }): TrailEntry<TData> | undefined => findEntryInStore(state.floating, state.trail, key);
}

const ZERO_OFFSET = Object.freeze({ x: 0, y: 0 });

/**
 * Selects the topmost active popover entry in z-index depth order.
 */
export function selectTopmostEntry<TData = unknown>(state: {
  zIndexOrder: readonly string[];
  floating: readonly TrailEntry<TData>[];
  trail: readonly TrailEntry<TData>[];
}): TrailEntry<TData> | undefined {
  for (let i = state.zIndexOrder.length - 1; i >= 0; i--) {
    const key = state.zIndexOrder[i];
    if (key) {
      const entry = findEntryInStore(state.floating, state.trail, key);
      if (entry && entry.transitionStatus !== 'unmounting') return entry;
    }
  }
  for (let i = state.trail.length - 1; i >= 0; i--) {
    const entry = state.trail[i];
    if (entry && entry.transitionStatus !== 'unmounting') return entry;
  }
  for (let i = state.floating.length - 1; i >= 0; i--) {
    const entry = state.floating[i];
    if (entry && entry.transitionStatus !== 'unmounting') return entry;
  }
  return undefined;
}

/**
 * Selects whether a popover entry with the target key is pinned.
 */
export function selectIsPinned(key: string) {
  return (state: { pinnedStates: Readonly<Record<string, boolean>> }): boolean =>
    Boolean(state.pinnedStates[key]);
}

/**
 * Selects drag coordinates offset for the specified popover key.
 */
export function selectOffset(key: string) {
  return (state: {
    offsets: Readonly<Record<string, Readonly<{ x: number; y: number }>>>;
  }): { x: number; y: number } => state.offsets[key] ?? ZERO_OFFSET;
}

/**
 * Selects the current z-index depth ordering array of keys.
 */
export function selectZIndexOrder(state: { zIndexOrder: readonly string[] }): readonly string[] {
  return state.zIndexOrder;
}

/**
 * Selects total count of open popovers across floating and trailing arrays.
 */
export function selectTotalActiveCount(state: {
  floating: readonly unknown[];
  trail: readonly unknown[];
}): number {
  return state.floating.length + state.trail.length;
}

/**
 * Selects whether the store is completely idle (0 popovers open).
 */
export function selectIsIdle(state: {
  floating: readonly unknown[];
  trail: readonly unknown[];
}): boolean {
  return state.floating.length === 0 && state.trail.length === 0;
}

/**
 * Selects whether a popover key is currently active in the store.
 */
export function selectHasEntry<TData = unknown>(key: string) {
  return (state: {
    floating: readonly TrailEntry<TData>[];
    trail: readonly TrailEntry<TData>[];
  }): boolean => hasEntryWithKey(state.floating, state.trail, key);
}

/**
 * Selects the root popover entry from the trail stack.
 */
export function selectRootEntry<TData = unknown>(state: {
  trail: readonly TrailEntry<TData>[];
}): TrailEntry<TData> | undefined {
  return state.trail[0];
}

/**
 * Selects whether a popover entry is currently loading.
 */
export function selectIsLoading<TData = unknown>(key: string) {
  return (state: {
    floating: readonly TrailEntry<TData>[];
    trail: readonly TrailEntry<TData>[];
  }): boolean => findEntryInStore(state.floating, state.trail, key)?.isLoading ?? false;
}

/**
 * Selects the error object for a popover entry if present.
 */
export function selectError<TData = unknown>(key: string) {
  return (state: {
    floating: readonly TrailEntry<TData>[];
    trail: readonly TrailEntry<TData>[];
  }): Error | null => findEntryInStore(state.floating, state.trail, key)?.error ?? null;
}

/**
 * Selects the resolved data payload for a popover entry if present.
 */
export function selectData<TData = unknown>(key: string) {
  return (state: {
    floating: readonly TrailEntry<TData>[];
    trail: readonly TrailEntry<TData>[];
  }): TData | null => findEntryInStore(state.floating, state.trail, key)?.data ?? null;
}

/**
 * Functional mapper type for pure store selectors operating on PopoverStore state tree.
 *
 * @template TData - Resolved payload type.
 * @template TContext - Global shared context type.
 * @template TResult - Return type computed by selector.
 */
export type StoreSelectorMapper<TData = unknown, TContext = unknown, TResult = unknown> = (
  state: import('../types').PopoverStore<TData, TContext>,
) => TResult;

/**
 * Factory creating a strongly typed selector helper bound to specific TData and TContext types.
 * Eliminates redundant generic signatures when defining custom selectors.
 */
export function createTypedStoreSelector<TData = unknown, TContext = unknown>() {
  return <TSelected>(selector: StoreSelectorMapper<TData, TContext, TSelected>) => selector;
}
