/**
 * Stack Management, Elevation, and Helper State Reducers for popover-trail store.
 *
 * @module store/reducers/stackReducers
 */

import type { TrailEntry, PopoverStateData } from '../../types';

/**
 * Filters a Record object, retaining only the keys present in the specified Set.
 */
export function filterRecord<T>(
  record: Record<string, T>,
  allowedKeys: Set<string>,
): Record<string, T> {
  const keys = Object.keys(record);
  if (keys.length === 0) return record;
  const nextRecord: Record<string, T> = {};
  let changed = false;
  for (const key of keys) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      changed = true;
      continue;
    }
    const val = record[key];
    if (allowedKeys.has(key) && val !== undefined) {
      nextRecord[key] = val;
    } else {
      changed = true;
    }
  }
  return changed ? nextRecord : record;
}

/**
 * Helper to collect all active popover keys from floating and trail arrays.
 */
export function getActiveKeys<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
): Set<string> {
  const activeKeys = new Set<string>();
  floating.forEach((e) => activeKeys.add(e.key));
  trail.forEach((e) => activeKeys.add(e.key));
  return activeKeys;
}

/**
 * Calculates the updated z-index depth order list.
 */
export function getNextZIndexOrder(
  zIndexOrder: readonly string[],
  activeKeys: Set<string>,
  newKey: string,
): string[] {
  return [...zIndexOrder.filter((k) => activeKeys.has(k) && k !== newKey), newKey];
}

/**
 * Builds a Map grouping popovers by their parent key IDs.
 */
export function getParentChildMap<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  useOriginalParent = false,
): Map<string, TrailEntry<TData>[]> {
  const map = new Map<string, TrailEntry<TData>[]>();

  const processList = (list: readonly TrailEntry<TData>[]) => {
    for (const entry of list) {
      const pKey = useOriginalParent
        ? (entry.originalParentKey ?? entry.parentKey)
        : (entry.parentKey ?? entry.originalParentKey);
      if (pKey) {
        let children = map.get(pKey);
        if (!children) {
          children = [];
          map.set(pKey, children);
        }
        children.push(entry);
      }
    }
  };

  processList(floating);
  processList(trail);

  return map;
}

/**
 * Traverses popover hierarchy to find all child descendants.
 */
export function getAllDescendants<TData>(
  parentKeys: Iterable<string>,
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  useOriginalParent = false,
): Set<string> {
  const descendants = new Set<string>();
  const parentMap = getParentChildMap(floating, trail, useOriginalParent);
  const queue = [...parentKeys];

  while (queue.length > 0) {
    const pKey = queue.pop();
    if (!pKey) continue;
    const children = parentMap.get(pKey);
    if (children) {
      for (const child of children) {
        if (!descendants.has(child.key)) {
          descendants.add(child.key);
          queue.push(child.key);
        }
      }
    }
  }

  return descendants;
}

/**
 * Pure state reducer updating entry properties within floating or trail lists.
 */
export function updateEntryInLists<TData, TContext>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  key: string,
  updatedEntry: TrailEntry<TData>,
): Partial<PopoverStateData<TData, TContext>> {
  const inFloating = floating.some((e) => e.key === key);
  if (inFloating) {
    return {
      floating: floating.map((e) => (e.key === key ? updatedEntry : e)),
      trail,
    };
  }
  return {
    floating,
    trail: trail.map((e) => (e.key === key ? updatedEntry : e)),
  };
}

/**
 * Pure state updater bringing a popover card to the top of the z-index depth order.
 */
export function bringToFrontPatch<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  key: string,
): Partial<PopoverStateData<TData, TContext>> {
  const isPinned = state.pinnedStates[key];

  let descendants: Set<string>;
  if (isPinned) {
    descendants = getAllDescendants([key], state.floating, state.trail, true);
  } else {
    descendants = getAllDescendants([key], state.floating, state.trail);
  }

  const keysToElevate = [key, ...descendants];
  const elevateSet = new Set(keysToElevate);

  const nextOrder = state.zIndexOrder.filter((k) => !elevateSet.has(k));
  for (const k of keysToElevate) {
    if (state.floating.some((e) => e.key === k) || state.trail.some((e) => e.key === k)) {
      nextOrder.push(k);
    }
  }

  if (
    nextOrder.length === state.zIndexOrder.length &&
    nextOrder.every((k, i) => k === state.zIndexOrder[i])
  ) {
    return {};
  }

  return { zIndexOrder: nextOrder };
}

/**
 * Pure state updater performing garbage collection cleanup on unreferenced state records.
 */
export function getCleanupStatePatch<TData, TContext>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  offsets: Record<string, { x: number; y: number }>,
  zIndexOrder: readonly string[],
  pinnedStates: Record<string, boolean>,
  nestedHydrationRequestCounters: Record<string, number>,
): Partial<PopoverStateData<TData, TContext>> {
  const activeKeys = getActiveKeys(floating, trail);
  const nextOffsets = filterRecord(offsets, activeKeys);
  const nextZIndexOrder = zIndexOrder.filter((k) => activeKeys.has(k));
  const nextPinnedStates = filterRecord(pinnedStates, activeKeys);
  const nextNestedCounters = filterRecord(nestedHydrationRequestCounters, activeKeys);

  type WritablePatch = {
    -readonly [P in keyof PopoverStateData<TData, TContext>]?: PopoverStateData<TData, TContext>[P];
  };

  const patch: WritablePatch = {
    offsets: nextOffsets,
    zIndexOrder: nextZIndexOrder,
    pinnedStates: nextPinnedStates,
    nestedHydrationRequestCounters: nextNestedCounters,
  };
  if (trail.length === 0) {
    patch.anchorElement = null;
    patch.anchorRect = null;
  }
  if (floating.length === 0 && trail.length === 0) {
    patch.zIndexOrder = [];
    patch.ownerId = null;
  }
  return patch;
}

/**
 * Builds a partial state patch object for restoring a historical snapshot.
 */
export function getSnapshotStatePatch<TData>(snapshot: {
  trail: readonly TrailEntry<TData>[];
  floating: readonly TrailEntry<TData>[];
  offsets: Record<string, { x: number; y: number }>;
  pinnedStates: Record<string, boolean>;
  zIndexOrder: readonly string[];
  ownerId: string | null;
}) {
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
