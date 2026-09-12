/**
 * Individual Entry and Property Selectors.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module storeEntrySelectors
 */

import type { TrailEntry, DragOffset } from '../../types';
import { findEntryInStore, hasEntryWithKey } from '../../utils/storeHelpers';
import { ZERO_OFFSET } from '../hydration';
import type {
  HasActiveEntriesState,
  HasOffsetsState,
  HasPinnedStates,
  HasZIndexState,
  HasStatusState,
} from './storeSelectorTypes';

export const selectEntryByKey =
  <TData = unknown, TPopoverKey extends string = string>(key: string) =>
  (state: HasActiveEntriesState<TData, TPopoverKey>): TrailEntry<TData, TPopoverKey> | undefined =>
    findEntryInStore(state.floating, state.trail, key);

export const selectHasEntry =
  <TData = unknown, TPopoverKey extends string = string>(key: string) =>
  (state: HasActiveEntriesState<TData, TPopoverKey>): boolean =>
    hasEntryWithKey(state.floating, state.trail, key);

export function selectRootEntry<TData = unknown, TPopoverKey extends string = string>(state: {
  trail: readonly TrailEntry<TData, TPopoverKey>[];
}): TrailEntry<TData, TPopoverKey> | undefined {
  return state.trail[0];
}

export const selectIsLoading =
  <TData = unknown, TPopoverKey extends string = string>(key: string) =>
  (state: HasActiveEntriesState<TData, TPopoverKey>): boolean =>
    findEntryInStore(state.floating, state.trail, key)?.isLoading ?? false;

export const selectError =
  <TData = unknown, TPopoverKey extends string = string>(key: string) =>
  (state: HasActiveEntriesState<TData, TPopoverKey>): Error | null =>
    findEntryInStore(state.floating, state.trail, key)?.error ?? null;

export const selectData =
  <TData = unknown, TPopoverKey extends string = string>(key: string) =>
  (state: HasActiveEntriesState<TData, TPopoverKey>): TData | null =>
    findEntryInStore(state.floating, state.trail, key)?.data ?? null;

export function selectParentKey<TPopoverKey extends string = string>(key: string) {
  return (state: HasActiveEntriesState<unknown, TPopoverKey>): TPopoverKey | undefined => {
    const entry = selectEntryByKey<unknown, TPopoverKey>(key)(state);
    return entry?.parentKey ?? entry?.originalParentKey;
  };
}

export function selectOffset<TPopoverKey extends string = string>(key: TPopoverKey) {
  return (state: HasOffsetsState<TPopoverKey>): DragOffset => state.offsets[key] ?? ZERO_OFFSET;
}
export const selectOffsetByKey = selectOffset;

export function selectIsPinned<TPopoverKey extends string = string>(key: TPopoverKey) {
  return (state: HasPinnedStates<TPopoverKey>): boolean => Boolean(state.pinnedStates[key]);
}

export function selectZIndexOrder<TPopoverKey extends string = string>(
  state: HasZIndexState<TPopoverKey>,
): readonly TPopoverKey[] {
  return state.zIndexOrder;
}

export function selectTopmostEntry<TData = unknown, TPopoverKey extends string = string>(
  state: HasActiveEntriesState<TData, TPopoverKey> & HasZIndexState<TPopoverKey>,
): TrailEntry<TData, TPopoverKey> | undefined {
  const { zIndexOrder, floating, trail } = state;
  if (zIndexOrder.length === 0) return trail.at(-1) ?? floating.at(-1);
  const topmostKey = zIndexOrder.at(-1);
  return topmostKey ? findEntryInStore(floating, trail, topmostKey) : undefined;
}

export function selectDiscriminatedStatus<TData = unknown, TPopoverKey extends string = string>(
  state: HasStatusState<TData, TPopoverKey>,
): 'idle' | 'active-trail' | 'pinned-only' {
  if (state.trail.length > 0) return 'active-trail';
  return state.floating.length > 0 ? 'pinned-only' : 'idle';
}
