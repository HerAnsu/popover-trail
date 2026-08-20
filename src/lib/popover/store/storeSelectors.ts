/**
 * Pure Store Selectors for popover-trail.
 * Pure, memoizable state tree query functions operating on minimal substate slices.
 *
 * @module storeSelectors
 */

import type { TrailEntry, DragOffset, PopoverStore } from '../types';
import { findEntryInStore, hasEntryWithKey } from '../utils/storeHelpers';
import { EMPTY_ARRAY } from './storeDefaults';

const ZERO_OFFSET: Readonly<DragOffset> = Object.freeze({ x: 0, y: 0 });

export interface HasTrailState<TData = unknown, TPopoverKey extends string = string> {
  readonly trail: readonly TrailEntry<TData, TPopoverKey>[];
}

export interface HasFloatingState<TData = unknown, TPopoverKey extends string = string> {
  readonly floating: readonly TrailEntry<TData, TPopoverKey>[];
}

export interface HasActiveEntriesState<TData = unknown, TPopoverKey extends string = string>
  extends HasTrailState<TData, TPopoverKey>, HasFloatingState<TData, TPopoverKey> {}

export interface HasPinnedStates<TPopoverKey extends string = string> {
  readonly pinnedStates: Readonly<Partial<Record<TPopoverKey, boolean>>>;
}

export interface HasOffsetsState<TPopoverKey extends string = string> {
  readonly offsets: Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>;
}

export interface HasZIndexState<TPopoverKey extends string = string> {
  readonly zIndexOrder: readonly TPopoverKey[];
}

export function selectActiveTrail<TData = unknown, TPopoverKey extends string = string>(
  state: HasTrailState<TData, TPopoverKey>,
): readonly TrailEntry<TData, TPopoverKey>[] {
  return state.trail;
}

export function selectFloatingEntries<TData = unknown, TPopoverKey extends string = string>(
  state: HasFloatingState<TData, TPopoverKey>,
): readonly TrailEntry<TData, TPopoverKey>[] {
  return state.floating;
}

export function selectEntryByKey<TData = unknown, TPopoverKey extends string = string>(
  key: string,
) {
  return (
    state: HasActiveEntriesState<TData, TPopoverKey>,
  ): TrailEntry<TData, TPopoverKey> | undefined =>
    findEntryInStore<TData, TPopoverKey>(state.floating, state.trail, key);
}

export function selectTopmostEntry<TData = unknown, TPopoverKey extends string = string>(
  state: HasActiveEntriesState<TData, TPopoverKey> & HasZIndexState<TPopoverKey>,
): TrailEntry<TData, TPopoverKey> | undefined {
  for (let i = state.zIndexOrder.length - 1; i >= 0; i--) {
    const key = state.zIndexOrder[i];
    if (key) {
      const entry = findEntryInStore<TData, TPopoverKey>(state.floating, state.trail, key);
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

export function selectIsPinned<TPopoverKey extends string = string>(key: string) {
  return (state: HasPinnedStates<TPopoverKey>): boolean =>
    Boolean(state.pinnedStates[key as TPopoverKey]);
}

export function selectOffset<TPopoverKey extends string = string>(key: string) {
  return (state: HasOffsetsState<TPopoverKey>): DragOffset =>
    state.offsets[key as TPopoverKey] ?? ZERO_OFFSET;
}

export function selectZIndexOrder<TPopoverKey extends string = string>(
  state: HasZIndexState<TPopoverKey>,
): readonly TPopoverKey[] {
  return state.zIndexOrder;
}

export function selectTotalActiveCount(state: {
  floating: readonly unknown[];
  trail: readonly unknown[];
}): number {
  return state.floating.length + state.trail.length;
}

export function selectIsIdle(state: {
  floating: readonly unknown[];
  trail: readonly unknown[];
}): boolean {
  return state.floating.length === 0 && state.trail.length === 0;
}

export function selectHasEntry<TData = unknown, TPopoverKey extends string = string>(key: string) {
  return (state: HasActiveEntriesState<TData, TPopoverKey>): boolean =>
    hasEntryWithKey(state.floating, state.trail, key);
}

export function selectRootEntry<TData = unknown, TPopoverKey extends string = string>(
  state: HasTrailState<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey> | undefined {
  return state.trail[0];
}

export function selectIsLoading<TData = unknown, TPopoverKey extends string = string>(key: string) {
  return (state: HasActiveEntriesState<TData, TPopoverKey>): boolean =>
    findEntryInStore(state.floating, state.trail, key)?.isLoading ?? false;
}

export function selectError<TData = unknown, TPopoverKey extends string = string>(key: string) {
  return (state: HasActiveEntriesState<TData, TPopoverKey>): Error | null =>
    findEntryInStore(state.floating, state.trail, key)?.error ?? null;
}

export function selectData<TData = unknown, TPopoverKey extends string = string>(key: string) {
  return (state: HasActiveEntriesState<TData, TPopoverKey>): TData | null =>
    findEntryInStore(state.floating, state.trail, key)?.data ?? null;
}

export function selectParentKey<TPopoverKey extends string = string>(key: string) {
  return (state: HasActiveEntriesState<unknown, TPopoverKey>): TPopoverKey | undefined => {
    const entry: TrailEntry<unknown, TPopoverKey> | undefined = findEntryInStore(
      state.floating,
      state.trail,
      key,
    );
    return entry?.parentKey ?? entry?.originalParentKey;
  };
}

function collectChildrenKeys<TPopoverKey extends string>(
  floating: readonly TrailEntry<unknown, TPopoverKey>[],
  trail: readonly TrailEntry<unknown, TPopoverKey>[],
  key: string,
): readonly TPopoverKey[] {
  const children: TPopoverKey[] = [];
  for (const e of floating) {
    if (e.parentKey === key || e.originalParentKey === key) children.push(e.key);
  }
  for (const e of trail) {
    if (e.parentKey === key || e.originalParentKey === key) children.push(e.key);
  }
  return children.length > 0 ? children : (EMPTY_ARRAY as readonly TPopoverKey[]);
}

export function selectChildrenKeys<TPopoverKey extends string = string>(key: string) {
  return (state: HasActiveEntriesState<unknown, TPopoverKey>): readonly TPopoverKey[] =>
    collectChildrenKeys(state.floating, state.trail, key);
}

function buildBreadcrumbPath<TPopoverKey extends string>(
  floating: readonly TrailEntry<unknown, TPopoverKey>[],
  trail: readonly TrailEntry<unknown, TPopoverKey>[],
  key: string,
): readonly TPopoverKey[] {
  const path: TPopoverKey[] = [];
  let currentKey: string | undefined = key;
  const visited = new Set<string>();

  while (currentKey && !visited.has(currentKey)) {
    visited.add(currentKey);
    const entry: TrailEntry<unknown, TPopoverKey> | undefined = findEntryInStore(
      floating,
      trail,
      currentKey,
    );
    if (!entry) break;

    path.push(entry.key);
    currentKey = entry.parentKey ?? entry.originalParentKey;
  }

  if (path.length === 0) return EMPTY_ARRAY as readonly TPopoverKey[];
  return path.toReversed();
}

export function selectBreadcrumbs<TPopoverKey extends string = string>(key: string) {
  return (state: HasActiveEntriesState<unknown, TPopoverKey>): readonly TPopoverKey[] =>
    buildBreadcrumbPath(state.floating, state.trail, key);
}

export function selectPopoverDepth<TPopoverKey extends string = string>(key: string) {
  return (state: HasActiveEntriesState<unknown, TPopoverKey>): number => {
    let depth = 0;
    let currentKey: string | undefined = key;
    const visited = new Set<string>();

    while (currentKey && !visited.has(currentKey)) {
      visited.add(currentKey);
      const entry: TrailEntry<unknown, TPopoverKey> | undefined = findEntryInStore(
        state.floating,
        state.trail,
        currentKey,
      );
      const parentKey: TPopoverKey | undefined = entry?.parentKey ?? entry?.originalParentKey;
      if (!parentKey) break;
      depth++;
      currentKey = parentKey;
    }

    return depth;
  };
}

export function selectTrailBranch<TData = unknown, TPopoverKey extends string = string>(
  key: string,
) {
  return (
    state: HasActiveEntriesState<TData, TPopoverKey>,
  ): readonly TrailEntry<TData, TPopoverKey>[] => {
    const breadcrumbKeys = new Set(selectBreadcrumbs(key)(state));
    const childrenKeys = new Set(selectChildrenKeys(key)(state));

    return [...state.floating, ...state.trail].filter(
      (entry) => breadcrumbKeys.has(entry.key) || childrenKeys.has(entry.key),
    );
  };
}

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

export function selectDiscriminatedStatus<TData = unknown>(state: {
  trail: readonly TrailEntry<TData>[];
  floating: readonly TrailEntry<TData>[];
}): 'idle' | 'active-trail' | 'pinned-only' {
  if (state.trail.length > 0) return 'active-trail';
  if (state.floating.length > 0) return 'pinned-only';
  return 'idle';
}
