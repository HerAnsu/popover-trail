/**
 * Stack Management, Elevation, and Helper State Reducers for popover-trail store.
 * Implements Zero-Allocation Structural Sharing to prevent unnecessary React re-renders.
 *
 * @module store/reducers/stackReducers
 */

import type { DragOffset, PopoverStateData, StatePatch, TrailEntry } from '../../types';
import type { HistorySnapshot } from '../history';
import { EMPTY_ARRAY, EMPTY_OBJECT } from '../storeDefaults';
import { shallowEqual } from '../../utils/equality';
import type { PopoverDAG } from '../../utils/dag';

function isUnsafeProperty(key: string): boolean {
  return key === '__proto__' || key === 'constructor' || key === 'prototype';
}

export function filterRecord<T, K extends string = string>(
  record: Partial<Record<K, T>>,
  allowedKeys: Set<K>,
): Partial<Record<K, T>> {
  if (allowedKeys.size === 0) return {};

  const nextRecord: Partial<Record<K, T>> = {};
  let changed = false;

  for (const key of allowedKeys) {
    if (isUnsafeProperty(key)) continue;
    const val = record[key];
    if (val !== undefined) {
      nextRecord[key] = val;
    }
  }

  if (Object.keys(record).length !== Object.keys(nextRecord).length) {
    changed = true;
  }

  return changed ? nextRecord : record;
}

export function getActiveKeys<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
): Set<TPopoverKey> {
  const activeKeys = new Set<TPopoverKey>();
  for (const entry of floating) activeKeys.add(entry.key);
  for (const entry of trail) activeKeys.add(entry.key);
  return activeKeys;
}

export function getNextZIndexOrder<TPopoverKey extends string = string>(
  zIndexOrder: readonly TPopoverKey[],
  activeKeys: Set<TPopoverKey>,
  newKey: TPopoverKey,
): readonly TPopoverKey[] {
  if (
    zIndexOrder.length > 0 &&
    zIndexOrder.at(-1) === newKey &&
    zIndexOrder.length === activeKeys.size &&
    zIndexOrder.every((k) => activeKeys.has(k))
  ) {
    return zIndexOrder;
  }

  return [...zIndexOrder.filter((k) => activeKeys.has(k) && k !== newKey), newKey];
}

function toEntryParentKey<TData, TPopoverKey extends string>(
  entry: TrailEntry<TData, TPopoverKey>,
  useOriginal: boolean,
): TPopoverKey | undefined {
  return useOriginal
    ? (entry.originalParentKey ?? entry.parentKey)
    : (entry.parentKey ?? entry.originalParentKey);
}

function enqueueChildDescendants<TData, TPopoverKey extends string>(
  entries: readonly TrailEntry<TData, TPopoverKey>[],
  pKey: TPopoverKey,
  useOriginal: boolean,
  descendants: Set<TPopoverKey>,
  queue: TPopoverKey[],
): void {
  for (const entry of entries) {
    if (toEntryParentKey(entry, useOriginal) === pKey && !descendants.has(entry.key)) {
      descendants.add(entry.key);
      queue.push(entry.key);
    }
  }
}

export function getAllDescendants<TData, TPopoverKey extends string = string>(
  parentKeys: Iterable<TPopoverKey>,
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  useOriginalParent = false,
  dag?: PopoverDAG<TPopoverKey>,
): Set<TPopoverKey> {
  const descendants = new Set<TPopoverKey>();

  if (dag && dag.size > 0) {
    for (const pKey of parentKeys) {
      dag.getDescendantKeysInto(pKey, descendants);
    }
    return descendants;
  }

  const queue = Array.isArray(parentKeys) ? [...parentKeys] : [...parentKeys];

  while (queue.length > 0) {
    const pKey = queue.pop();
    if (!pKey) continue;

    enqueueChildDescendants(floating, pKey, useOriginalParent, descendants, queue);
    enqueueChildDescendants(trail, pKey, useOriginalParent, descendants, queue);
  }

  return descendants;
}

export function updateEntryInLists<TData, TContext, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: TPopoverKey,
  updatedEntry: TrailEntry<TData, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  const floatingIdx = floating.findIndex((e) => e.key === key);
  if (floatingIdx !== -1) {
    const current = floating[floatingIdx];
    if (current === updatedEntry || shallowEqual(current, updatedEntry)) {
      return {};
    }
    const nextFloating = [...floating];
    nextFloating[floatingIdx] = updatedEntry;
    return {
      floating: nextFloating,
      trail,
    };
  }

  const trailIdx = trail.findIndex((e) => e.key === key);
  if (trailIdx !== -1) {
    const current = trail[trailIdx];
    if (current === updatedEntry || shallowEqual(current, updatedEntry)) {
      return {};
    }
    const nextTrail = [...trail];
    nextTrail[trailIdx] = updatedEntry;
    return {
      floating,
      trail: nextTrail,
    };
  }

  return {};
}

export function bringToFrontPatch<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  dag?: PopoverDAG<TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  const descendants = getAllDescendants<TData, TPopoverKey>(
    [key],
    state.floating,
    state.trail,
    true,
    dag,
  );

  const keysToElevate: TPopoverKey[] = [key, ...descendants];
  const elevateSet = new Set<TPopoverKey>(keysToElevate);

  const activeKeys = getActiveKeys<TData, TPopoverKey>(state.floating, state.trail);
  const nextOrder = state.zIndexOrder.filter((k) => !elevateSet.has(k));
  for (const k of keysToElevate) {
    if (activeKeys.has(k)) {
      nextOrder.push(k);
    }
  }

  if (
    nextOrder.length === state.zIndexOrder.length &&
    nextOrder.every((k, i) => k === state.zIndexOrder[i])
  ) {
    return {};
  }

  return {
    zIndexOrder: nextOrder,
  };
}

export function getCleanupStatePatch<TData, TContext, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  offsets: Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>,
  zIndexOrder: readonly TPopoverKey[],
  pinnedStates: Readonly<Partial<Record<TPopoverKey, boolean>>>,
  nestedHydrationRequestCounters: Readonly<Partial<Record<TPopoverKey, number>>>,
): StatePatch<TData, TContext, TPopoverKey> {
  const activeKeys = getActiveKeys(floating ?? EMPTY_ARRAY, trail ?? EMPTY_ARRAY);
  const nextOffsets = filterRecord(offsets ?? EMPTY_OBJECT, activeKeys);
  const nextZIndexOrder = (zIndexOrder ?? EMPTY_ARRAY).filter((k) => activeKeys.has(k));
  const nextPinnedStates = filterRecord(pinnedStates ?? EMPTY_OBJECT, activeKeys);
  const nextNestedCounters = filterRecord(
    nestedHydrationRequestCounters ?? EMPTY_OBJECT,
    activeKeys,
  );

  return {
    offsets: nextOffsets,
    zIndexOrder: nextZIndexOrder,
    pinnedStates: nextPinnedStates,
    nestedHydrationRequestCounters: nextNestedCounters,
    ...(trail.length === 0 ? { anchorElement: null, anchorRect: null } : {}),
    ...(floating.length === 0 && trail.length === 0
      ? { zIndexOrder: EMPTY_ARRAY, ownerId: null }
      : {}),
  };
}

export function getSnapshotStatePatch<
  TData,
  TContext = unknown,
  TPopoverKey extends string = string,
>(snapshot: HistorySnapshot<TData, TPopoverKey>): StatePatch<TData, TContext, TPopoverKey> {
  return {
    trail: snapshot.trail,
    floating: snapshot.floating,
    offsets: snapshot.offsets,
    pinnedStates: snapshot.pinnedStates,
    zIndexOrder: snapshot.zIndexOrder,
    ownerId: snapshot.ownerId,
    ...(snapshot.trail.length === 0 ? { anchorElement: null, anchorRect: null } : {}),
  };
}
