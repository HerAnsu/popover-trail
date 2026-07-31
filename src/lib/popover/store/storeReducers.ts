/**
 * Pure Store State Reducers for popover-trail.
 * Pure, side-effect-free reducer functions computing state tree patches.
 *
 * @module storeReducers
 */

import type { TrailEntry, PopoverStateData } from '../types';

/**
 * Filters a Record object, retaining only the keys present in the specified Set.
 */
function filterRecord<T>(record: Record<string, T>, allowedKeys: Set<string>): Record<string, T> {
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
function getActiveKeys<TData>(
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
function getNextZIndexOrder(
  zIndexOrder: readonly string[],
  activeKeys: Set<string>,
  newKey: string,
): string[] {
  return [...zIndexOrder.filter((k) => activeKeys.has(k) && k !== newKey), newKey];
}

/**
 * Builds a Map grouping popovers by their parent key IDs.
 */
function getParentChildMap<TData>(
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
function getAllDescendants<TData>(
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

  let nextOrder = state.zIndexOrder.filter((k) => !keysToElevate.includes(k));
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
  return patch as Partial<PopoverStateData<TData, TContext>>;
}

/**
 * Pure state updater for spawning or opening a new root popover.
 */
export function openRootState<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  ownerId: string,
  entry: TrailEntry<TData>,
): Partial<PopoverStateData<TData, TContext>> {
  const hasFloating = state.floating.some((e) => e.key === entry.key);
  if (hasFloating) {
    return bringToFrontPatch(state, entry.key);
  }
  const nextEntry = {
    ...entry,
    originalRect: entry.originalRect ?? entry.rect,
  };
  const isSameOwner = state.ownerId === ownerId;
  const filteredTrail = state.trail.filter((e) => e.key !== entry.key);
  const nextTrail = isSameOwner ? [...filteredTrail, nextEntry] : [nextEntry];

  const activeKeys = getActiveKeys(state.floating, nextTrail);

  return {
    ownerId,
    trail: nextTrail,
    offsets: filterRecord(state.offsets, activeKeys),
    zIndexOrder: getNextZIndexOrder(state.zIndexOrder, activeKeys, entry.key),
  };
}

/**
 * Pure state updater for pushing or appending a nested popover into the active path.
 */
export function pushNestedState<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  index: number,
  entry: TrailEntry<TData>,
): Partial<PopoverStateData<TData, TContext>> {
  const hasFloating = state.floating.some((e) => e.key === entry.key);
  if (hasFloating) {
    return bringToFrontPatch(state, entry.key);
  }

  const isFloating = index < state.floating.length;
  let nextTrail: TrailEntry<TData>[];
  const finalEntry = {
    ...entry,
    originalParentKey: entry.originalParentKey ?? entry.parentKey,
    originalRect: entry.originalRect ?? entry.rect,
  };

  if (isFloating) {
    const floatingEntry = state.floating[index];
    if (!floatingEntry || floatingEntry.key === entry.key) return {};
    nextTrail = [finalEntry];
  } else {
    const trailIndex = index - state.floating.length;
    const parentEntry = state.trail[trailIndex];
    if (!parentEntry || parentEntry.key === entry.key) return {};
    if (finalEntry.parentKey === finalEntry.key) {
      finalEntry.parentKey = undefined;
    }
    const baseTrail = state.trail.slice(0, trailIndex + 1).filter((e) => e.key !== entry.key);
    nextTrail = [...baseTrail, finalEntry];
  }

  const activeKeys = getActiveKeys(state.floating, nextTrail);

  return {
    trail: nextTrail,
    offsets: filterRecord(state.offsets, activeKeys),
    zIndexOrder: getNextZIndexOrder(state.zIndexOrder, activeKeys, entry.key),
  };
}

/**
 * Pure state updater for toggling a popover's modeless pinned/floating vs trailing status.
 */
export function togglePinState<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  key: string,
  rect?: DOMRect,
): Partial<PopoverStateData<TData, TContext>> {
  const floatingIndex = state.floating.findIndex((e) => e.key === key);
  const wasPinned = floatingIndex !== -1;
  const nextFloating = [...state.floating];
  const nextTrail = [...state.trail];
  const nextPinnedStates = { ...state.pinnedStates };
  const nextOffsets = { ...state.offsets };
  let nextZIndexOrder = [...state.zIndexOrder];

  if (!wasPinned) {
    const trailIndex = state.trail.findIndex((e) => e.key === key);
    if (trailIndex !== -1) {
      const entry = state.trail[trailIndex];
      if (!entry) return {};
      const updatedEntry = {
        ...entry,
        rect: rect ?? entry.rect,
        pinnedLayoutPos: rect ? { top: rect.top, left: rect.left } : undefined,
        parentKey: undefined,
      };
      nextTrail.splice(trailIndex, 1);
      nextFloating.push(updatedEntry);
      nextOffsets[key] = { x: 0, y: 0 };
      nextPinnedStates[key] = true;
      nextZIndexOrder = [...nextZIndexOrder.filter((k) => k !== key), key];
    }
  } else {
    const entry = nextFloating[floatingIndex];
    nextFloating.splice(floatingIndex, 1);
    nextPinnedStates[key] = false;
    if (entry) {
      nextTrail.push({
        ...entry,
        rect: entry.originalRect ?? entry.rect,
        parentKey: entry.originalParentKey ?? entry.parentKey,
        pinnedLayoutPos: undefined,
      });
    }
  }

  const cleanupPatch = getCleanupStatePatch<TData, TContext>(
    nextFloating,
    nextTrail,
    nextOffsets,
    nextZIndexOrder,
    nextPinnedStates,
    state.nestedHydrationRequestCounters,
  );

  return {
    floating: nextFloating,
    trail: nextTrail,
    ...cleanupPatch,
  };
}

/**
 * Pure state updater for closing popovers starting at a target virtual index.
 */
export function closeFromState<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  index: number,
): Partial<PopoverStateData<TData, TContext>> {
  const totalCount = state.floating.length + state.trail.length;
  if (index < 0 || index >= totalCount) return {};

  const isFloating = index < state.floating.length;
  const nextPinnedStates = { ...state.pinnedStates };

  let directClosedKeys: string[];
  if (isFloating) {
    const entry = state.floating[index];
    if (!entry) return {};
    directClosedKeys = [entry.key];
  } else {
    const trailIndex = index - state.floating.length;
    directClosedKeys = state.trail.slice(trailIndex).map((e) => e.key);
  }

  let descendants = getAllDescendants(directClosedKeys, state.floating, state.trail);
  if (!state.closePinnedDescendants) {
    const floatingKeys = new Set(state.floating.map((e) => e.key));
    descendants = new Set([...descendants].filter((key) => !floatingKeys.has(key)));
  }
  const removedKeys = new Set<string>([...directClosedKeys, ...descendants]);

  const nextFloating = state.floating.filter((e) => !removedKeys.has(e.key));
  const nextTrail = state.trail.filter((e) => !removedKeys.has(e.key));

  for (const key of removedKeys) {
    nextPinnedStates[key] = false;
  }

  const cleanupPatch = getCleanupStatePatch<TData, TContext>(
    nextFloating,
    nextTrail,
    state.offsets,
    state.zIndexOrder,
    nextPinnedStates,
    state.nestedHydrationRequestCounters,
  );

  return {
    floating: nextFloating,
    trail: nextTrail,
    ...cleanupPatch,
  };
}

/**
 * Computes the set of popover keys to remove when closing from a target index.
 */
export function getRemovedKeysForClose<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  index: number,
  closePinnedDescendants: boolean,
): { isFloating: boolean; removedKeys: Set<string> } | null {
  const totalCount = floating.length + trail.length;
  if (index < 0 || index >= totalCount) return null;

  const isFloating = index < floating.length;
  let directClosedKeys: string[];
  if (isFloating) {
    const entry = floating[index];
    directClosedKeys = entry ? [entry.key] : [];
  } else {
    const trailIndex = index - floating.length;
    directClosedKeys = trail.slice(trailIndex).map((e) => e.key);
  }
  const descendants = getAllDescendants(directClosedKeys, floating, trail);
  if (!closePinnedDescendants) {
    const floatingKeys = new Set(floating.map((e) => e.key));
    for (const key of descendants) {
      if (floatingKeys.has(key)) {
        descendants.delete(key);
      }
    }
  }
  return {
    isFloating,
    removedKeys: new Set<string>([...directClosedKeys, ...descendants]),
  };
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
