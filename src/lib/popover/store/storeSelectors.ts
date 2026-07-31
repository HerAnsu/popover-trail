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

/**
 * Selects the topmost active popover entry in z-index depth order.
 */
export function selectTopmostEntry<TData = unknown>(state: {
  zIndexOrder: readonly string[];
  floating: readonly TrailEntry<TData>[];
  trail: readonly TrailEntry<TData>[];
}): TrailEntry<TData> | undefined {
  if (state.zIndexOrder.length === 0) return undefined;
  const topKey = state.zIndexOrder[state.zIndexOrder.length - 1];
  return topKey ? findEntryInStore(state.floating, state.trail, topKey) : undefined;
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
  }): { x: number; y: number } => state.offsets[key] ?? { x: 0, y: 0 };
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
