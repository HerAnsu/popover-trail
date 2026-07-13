import { createStore } from "zustand/vanilla";
import type {
  PopoverStore,
  PopoverResolver,
  TrailEntry,
  PopoverStateData,
  PopoverActions,
  PopoverCache,
} from "./types";
import equal from "fast-deep-equal";

/**
 * Returns true if a value is a Promise or a thenable object.
 */
function isPromise<T>(value: any): value is Promise<T> {
  return typeof value === "object" && value !== null && typeof value.then === "function";
}

/**
 * Filter a record object, retaining only the keys present in the allowed set.
 */
function filterRecord<T>(record: Record<string, T>, allowedKeys: Set<string>): Record<string, T> {
  const nextRecord: Record<string, T> = {};
  let changed = false;
  for (const key of Object.keys(record)) {
    if (allowedKeys.has(key)) {
      nextRecord[key] = record[key];
    } else {
      changed = true;
    }
  }
  return changed ? nextRecord : record;
}

/**
 * Retrieves a popover entry safely using a unified index.
 */
function getEntryAtIndex<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  index: number,
): TrailEntry<TData> | undefined {
  if (index < 0) return undefined;
  if (index < floating.length) {
    return floating[index];
  }
  const trailIndex = index - floating.length;
  return trail[trailIndex];
}

/**
 * Finds the virtual index of a popover entry by its key.
 */
function findEntryIndex(
  floating: readonly TrailEntry[],
  trail: readonly TrailEntry[],
  key: string,
): number {
  const fIndex = floating.findIndex((e) => e.key === key);
  if (fIndex !== -1) return fIndex;
  const tIndex = trail.findIndex((e) => e.key === key);
  if (tIndex !== -1) return floating.length + tIndex;
  return -1;
}

/**
 * Returns true if a popover with the given key is currently active.
 */
function hasEntryWithKey(
  floating: readonly TrailEntry[],
  trail: readonly TrailEntry[],
  key: string,
): boolean {
  return floating.some((e) => e.key === key) || trail.some((e) => e.key === key);
}

/**
 * Calculates the updated z-index render order list, bringing the new key to the front.
 */
function getNextZIndexOrder(
  zIndexOrder: readonly string[],
  activeKeys: Set<string>,
  newKey: string,
): string[] {
  return [...zIndexOrder.filter((k) => activeKeys.has(k) && k !== newKey), newKey];
}

/**
 * Retrieves all children and descendants spawned by a parent popover.
 */
function getDescendants(
  parentKey: string,
  floating: readonly TrailEntry[],
  trail: readonly TrailEntry[],
): TrailEntry[] {
  const descendants: TrailEntry[] = [];
  const queue = [parentKey];
  const visited = new Set<string>([parentKey]);
  const floatingKeys = new Set(floating.map((e) => e.key));

  // Build children adjacency list in linear time O(N)
  const childrenMap = new Map<string, TrailEntry[]>();
  const mapEntry = (entry: TrailEntry) => {
    if (entry.parentKey) {
      let list = childrenMap.get(entry.parentKey);
      if (!list) {
        list = [];
        childrenMap.set(entry.parentKey, list);
      }
      list.push(entry);
    }
  };
  floating.forEach(mapEntry);
  trail.forEach(mapEntry);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined) break;

    const children = childrenMap.get(current);
    if (children) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!visited.has(child.key)) {
          if (floatingKeys.has(child.key)) continue;
          visited.add(child.key);
          descendants.push(child);
          queue.push(child.key);
        }
      }
    }
  }
  return descendants;
}

/**
 * Recursively retrieves all descendant keys (both trailing and floating) spawned by a parent popover.
 * It tracks parent-child linkages via both current parentKey and originalParentKey.
 */
function getAllDescendants(
  parentKeys: string[],
  floating: readonly TrailEntry[],
  trail: readonly TrailEntry[],
): Set<string> {
  const descendants = new Set<string>();
  const queue = [...parentKeys];
  const visited = new Set<string>(parentKeys);

  // Build children adjacency list in linear time O(N)
  const childrenMap = new Map<string, TrailEntry[]>();
  const mapEntry = (entry: TrailEntry) => {
    const pKey = entry.parentKey ?? entry.originalParentKey;
    if (pKey) {
      let list = childrenMap.get(pKey);
      if (!list) {
        list = [];
        childrenMap.set(pKey, list);
      }
      list.push(entry);
    }
  };
  floating.forEach(mapEntry);
  trail.forEach(mapEntry);

  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];

    const children = childrenMap.get(current);
    if (children) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!visited.has(child.key)) {
          visited.add(child.key);
          descendants.add(child.key);
          queue.push(child.key);
        }
      }
    }
  }
  return descendants;
}

/**
 * Focuses a popover and drags its children trail to the top of z-index.
 */
function bringToFrontPatch<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  key: string,
): Partial<PopoverStateData<TData, TContext>> {
  const descendantEntries = getDescendants(key, state.floating, state.trail);
  const keysToMove = [...descendantEntries.map((e) => e.key), key];
  const keysToMoveSet = new Set(keysToMove);
  const nextZIndexOrder = [
    ...state.zIndexOrder.filter((k) => !keysToMoveSet.has(k)),
    ...keysToMove,
  ];
  const index = state.floating.findIndex((e) => e.key === key);
  let nextFloating = state.floating;

  if (index !== -1) {
    const clickedEntry = state.floating[index];
    const floatingKeySet = new Set(state.floating.map((f) => f.key));
    const floatingDescendants = descendantEntries.filter((e) => floatingKeySet.has(e.key));
    const floatingKeysToMove = new Set<string>([key]);
    for (const desc of floatingDescendants) {
      floatingKeysToMove.add(desc.key);
    }
    nextFloating = [
      ...state.floating.filter((e) => !floatingKeysToMove.has(e.key)),
      clickedEntry,
      ...floatingDescendants,
    ];
  }
  return {
    zIndexOrder: nextZIndexOrder,
    floating: nextFloating,
  };
}

/**
 * Builds a state patch containing cleaned offsets, zIndexOrder,
 * and pinnedStates based on the current active popover keys.
 */
function getCleanupStatePatch<TData, TContext>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  offsets: Record<string, { x: number; y: number }>,
  zIndexOrder: string[],
  pinnedStates: Record<string, boolean>,
  nestedHydrationRequestCounters: Record<string, number>,
): Partial<PopoverStateData<TData, TContext>> {
  const activeKeys = new Set<string>();
  floating.forEach((e) => activeKeys.add(e.key));
  trail.forEach((e) => activeKeys.add(e.key));

  const nextOffsets = filterRecord(offsets, activeKeys);
  const nextZIndexOrder = zIndexOrder.filter((k) => activeKeys.has(k));
  const nextPinnedStates = filterRecord(pinnedStates, activeKeys);
  const nextNestedCounters = filterRecord(nestedHydrationRequestCounters, activeKeys);

  const patch: Partial<PopoverStateData<TData, TContext>> = {
    offsets: nextOffsets,
    zIndexOrder: nextZIndexOrder,
    pinnedStates: nextPinnedStates,
    nestedHydrationRequestCounters: nextNestedCounters,
  };
  if (floating.length === 0 && trail.length === 0) {
    patch.zIndexOrder = [];
    patch.anchorElement = null;
    patch.anchorRect = null;
    patch.ownerId = null;
  }
  return patch;
}

/**
 * Pure state updater for spawning/opening a new root popover.
 */
function openRootState<TData, TContext>(
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
  const nextTrail = isSameOwner ? [...state.trail, nextEntry] : [nextEntry];

  const activeKeys = new Set<string>();
  state.floating.forEach((e) => activeKeys.add(e.key));
  nextTrail.forEach((e) => activeKeys.add(e.key));

  return {
    ownerId,
    trail: nextTrail,
    offsets: filterRecord(state.offsets, activeKeys),
    zIndexOrder: getNextZIndexOrder(state.zIndexOrder, activeKeys, entry.key),
  };
}

/**
 * Pure state updater for pushing/opening a nested popover.
 */
function pushNestedState<TData, TContext>(
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
    if (floatingEntry.key === entry.key) return {};
    nextTrail = [finalEntry];
  } else {
    const trailIndex = index - state.floating.length;
    const parentEntry = state.trail[trailIndex];
    if (parentEntry.key === entry.key) return {};
    if (finalEntry.parentKey === finalEntry.key) {
      finalEntry.parentKey = undefined;
    }
    // insert trail entry after the specified index in the trail
    nextTrail = state.trail.slice(0, trailIndex + 1).concat(finalEntry);
  }

  const activeKeys = new Set<string>();
  state.floating.forEach((e) => activeKeys.add(e.key));
  nextTrail.forEach((e) => activeKeys.add(e.key));

  return {
    trail: nextTrail,
    offsets: filterRecord(state.offsets, activeKeys),
    zIndexOrder: getNextZIndexOrder(state.zIndexOrder, activeKeys, entry.key),
  };
}

/**
 * Pure state updater for toggling a popover's pinned vs trailing state.
 */
function togglePinState<TData, TContext>(
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
 * Pure state updater for closing popovers starting at a target index.
 */
function closeFromState<TData, TContext>(
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
    directClosedKeys = [entry.key];
  } else {
    const trailIndex = index - state.floating.length;
    directClosedKeys = state.trail.slice(trailIndex).map((e) => e.key);
  }

  // Find all descendants recursively (both pinned and unpinned)
  let descendants = getAllDescendants(directClosedKeys, state.floating, state.trail);
  if (!state.closePinnedDescendants) {
    const floatingKeys = new Set(state.floating.map((e) => e.key));
    descendants = new Set([...descendants].filter((key) => !floatingKeys.has(key)));
  }
  const removedKeys = new Set<string>([...directClosedKeys, ...descendants]);

  // Clean arrays by filtering out removed keys
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
 * Creates the generic Zustand popover store.
 */
export function createPopoverStore<TData = any, TContext = any>(
  resolveData: PopoverResolver<TData, TContext>,
  initialContext?: TContext,
  cache?: PopoverCache<TData>,
) {
  const activeControllers = new Map<string, AbortController>();

  return createStore<PopoverStore<TData, TContext>>((set, get) => {
    const actions: PopoverActions<TData, TContext> = {
      setContext: (context) => {
        if (!equal(get().context, context)) {
          set({ context });
        }
      },

      setOwnerId: (ownerId) => {
        if (get().ownerId !== ownerId) {
          set({ ownerId });
        }
      },

      openRoot: (ownerId, entry) => {
        set((state) => openRootState(state, ownerId, entry));
      },

      pushNested: (index, entry) => {
        set((state) => pushNestedState(state, index, entry));
      },

      togglePin: (key, rect) => {
        set((state) => togglePinState(state, key, rect));
      },

      bringToFront: (key) => {
        set((state) => {
          if (!hasEntryWithKey(state.floating, state.trail, key)) return {};
          return bringToFrontPatch(state, key);
        });
      },

      closeFrom: (index) => {
        const { floating, trail, closePinnedDescendants } = get();
        const totalCount = floating.length + trail.length;
        if (index >= 0 && index < totalCount) {
          const isFloating = index < floating.length;
          let directClosedKeys: string[];
          if (isFloating) {
            directClosedKeys = [floating[index].key];
          } else {
            const trailIndex = index - floating.length;
            directClosedKeys = trail.slice(trailIndex).map((e) => e.key);
          }
          let descendants = getAllDescendants(directClosedKeys, floating, trail);
          if (!closePinnedDescendants) {
            const floatingKeys = new Set(floating.map((e) => e.key));
            descendants = new Set([...descendants].filter((key) => !floatingKeys.has(key)));
          }
          const removedKeys = new Set<string>([...directClosedKeys, ...descendants]);

          for (const key of removedKeys) {
            const controller = activeControllers.get(key);
            if (controller) {
              controller.abort();
              activeControllers.delete(key);
            }
          }
        }
        set((state) => closeFromState(state, index));
      },

      updateOffset: (key, x, y) => {
        set((state) => ({
          offsets: {
            ...state.offsets,
            [key]: { x, y },
          },
        }));
      },

      clear: () => {
        // Abort all in-flight requests
        for (const controller of activeControllers.values()) {
          controller.abort();
        }
        activeControllers.clear();

        set({
          ownerId: null,
          trail: [],
          floating: [],
          offsets: {},
          pinnedStates: {},
          zIndexOrder: [],
          rootHydrationRequestCounter: 0,
          nestedHydrationRequestCounters: {},
          anchorElement: null,
          anchorRect: null,
        });
      },

      clearTrail: () => {
        // Abort the root hydration request and any trail-related nested requests
        const rootController = activeControllers.get("__root__");
        if (rootController) {
          rootController.abort();
          activeControllers.delete("__root__");
        }
        const {
          trail,
          floating,
          pinnedStates,
          offsets,
          zIndexOrder,
          nestedHydrationRequestCounters,
          closePinnedDescendants,
        } = get();
        const trailKeys = trail.map((e) => e.key);
        let descendants = getAllDescendants(trailKeys, floating, trail);
        if (!closePinnedDescendants) {
          const floatingKeys = new Set(floating.map((e) => e.key));
          descendants = new Set([...descendants].filter((key) => !floatingKeys.has(key)));
        }
        const removedKeys = new Set<string>([...trailKeys, ...descendants]);

        for (const key of removedKeys) {
          const controller = activeControllers.get(key);
          if (controller) {
            controller.abort();
            activeControllers.delete(key);
          }
        }

        const nextFloating = floating.filter((e) => !removedKeys.has(e.key));
        const nextPinnedStates = { ...pinnedStates };
        for (const key of removedKeys) {
          nextPinnedStates[key] = false;
        }

        const cleanupPatch = getCleanupStatePatch<TData, TContext>(
          nextFloating,
          [],
          offsets,
          zIndexOrder,
          nextPinnedStates,
          nestedHydrationRequestCounters,
        );

        set({
          trail: [],
          floating: nextFloating,
          ...cleanupPatch,
        });
      },

      closeTopmost: () => {
        const { zIndexOrder, floating, trail } = get();
        if (zIndexOrder.length === 0) return;
        const topKey = zIndexOrder[zIndexOrder.length - 1];
        const idx = findEntryIndex(floating, trail, topKey);
        if (idx !== -1) {
          set((state) => closeFromState(state, idx));
        }
      },

      // Async/Hydration Actions
      openRootWithResolver: async (keyOrName, anchorEvent, options) => {
        anchorEvent.stopPropagation();
        const { ownerId, context, rootHydrationRequestCounter, cache } = get();
        const finalOwnerId = options?.ownerId ?? ownerId ?? "default";
        const localCollision = options?.collision;

        const anchorElement = anchorEvent.currentTarget;
        const anchorRect = anchorElement.getBoundingClientRect();

        // Save anchor details immediately
        set({ anchorElement, anchorRect });

        // Abort previous root loading requests if any
        const prevController = activeControllers.get("__root__");
        if (prevController) {
          prevController.abort();
        }
        const controller = new AbortController();
        activeControllers.set("__root__", controller);

        // 1. Check cache first
        const cachedResultOrPromise = cache ? cache.get(keyOrName) : undefined;
        if (cachedResultOrPromise !== undefined) {
          if (!isPromise(cachedResultOrPromise)) {
            const resolved = cachedResultOrPromise;
            const entry: TrailEntry<TData> = {
              key: keyOrName,
              rect: anchorRect,
              originalRect: anchorRect,
              data: resolved,
              isLoading: false,
              collision: localCollision,
            };
            set((state) => openRootState(state, finalOwnerId, entry));
            activeControllers.delete("__root__");
            return;
          }
        }

        // 2. Fall back to resolver
        const resultOrPromise =
          cachedResultOrPromise !== undefined
            ? cachedResultOrPromise
            : resolveData(keyOrName, undefined, context ?? undefined, controller.signal);

        if (!isPromise(resultOrPromise)) {
          const resolved = resultOrPromise;
          const entry: TrailEntry<TData> = {
            key: keyOrName,
            rect: anchorRect,
            originalRect: anchorRect,
            data: resolved,
            isLoading: false,
            collision: localCollision,
          };
          set((state) => openRootState(state, finalOwnerId, entry));
          if (cache && resolved !== undefined) {
            void cache.set(keyOrName, resolved as TData);
          }
          activeControllers.delete("__root__");
          return;
        }

        const nextCounter = rootHydrationRequestCounter + 1;
        set({ rootHydrationRequestCounter: nextCounter });

        // Pre-create loading entry
        const loadingEntry: TrailEntry<TData> = {
          key: keyOrName,
          rect: anchorRect,
          originalRect: anchorRect,
          isLoading: true,
          collision: localCollision,
        };
        set((state) => openRootState(state, finalOwnerId, loadingEntry));

        try {
          const resolved = await resultOrPromise;

          // Verify we aren't handling a stale response
          if (get().rootHydrationRequestCounter !== nextCounter) return;

          // Update cache
          if (cache && resolved !== undefined) {
            void cache.set(keyOrName, resolved as TData);
          }

          // Update data
          set((state) => {
            const nextTrail = state.trail.map((e) =>
              e.key === keyOrName ? { ...e, isLoading: false, data: resolved, error: null } : e,
            );
            return { trail: nextTrail };
          });
        } catch (err) {
          if (controller.signal.aborted) return;
          if (get().rootHydrationRequestCounter !== nextCounter) return;
          set((state) => {
            const nextTrail = state.trail.map((e) =>
              e.key === keyOrName
                ? {
                    ...e,
                    isLoading: false,
                    error: err instanceof Error ? err : new Error(String(err)),
                  }
                : e,
            );
            return { trail: nextTrail };
          });
        } finally {
          if (activeControllers.get("__root__") === controller) {
            activeControllers.delete("__root__");
          }
        }
      },

      openNestedWithResolver: async (keyOrName, sourceKey, options) => {
        const { floating, trail, context, nestedHydrationRequestCounters, cache } = get();
        const sourceIndex = findEntryIndex(floating, trail, sourceKey);
        if (sourceIndex === -1) return;

        const sourceEntry = getEntryAtIndex(floating, trail, sourceIndex);
        if (!sourceEntry) return;

        // Abort previous loading requests for this key if any
        const prevController = activeControllers.get(keyOrName);
        if (prevController) {
          prevController.abort();
        }
        const controller = new AbortController();
        activeControllers.set(keyOrName, controller);

        const triggerRect = options?.triggerRect;
        const localCollision = options?.collision;
        const rect = triggerRect ?? sourceEntry.rect;

        // 1. Check cache first
        const cachedResultOrPromise = cache ? cache.get(keyOrName) : undefined;
        if (cachedResultOrPromise !== undefined) {
          if (!isPromise(cachedResultOrPromise)) {
            const resolved = cachedResultOrPromise;
            const entry: TrailEntry<TData> = {
              key: keyOrName,
              parentKey: sourceKey,
              originalParentKey: sourceKey,
              rect,
              originalRect: rect,
              data: resolved,
              isLoading: false,
              collision: localCollision,
            };
            set((state) => pushNestedState(state, sourceIndex, entry));
            activeControllers.delete(keyOrName);
            return;
          }
        }

        // 2. Fall back to resolver
        const resultOrPromise =
          cachedResultOrPromise !== undefined
            ? cachedResultOrPromise
            : resolveData(keyOrName, sourceEntry.data, context ?? undefined, controller.signal);

        if (!isPromise(resultOrPromise)) {
          const resolved = resultOrPromise;
          const entry: TrailEntry<TData> = {
            key: keyOrName,
            parentKey: sourceKey,
            originalParentKey: sourceKey,
            rect,
            originalRect: rect,
            data: resolved,
            isLoading: false,
            collision: localCollision,
          };
          set((state) => pushNestedState(state, sourceIndex, entry));
          if (cache && resolved !== undefined) {
            void cache.set(keyOrName, resolved as TData);
          }
          activeControllers.delete(keyOrName);
          return;
        }

        const nextCounter = (nestedHydrationRequestCounters[sourceKey] ?? 0) + 1;
        set((state) => ({
          nestedHydrationRequestCounters: {
            ...state.nestedHydrationRequestCounters,
            [sourceKey]: nextCounter,
          },
        }));

        // Pre-create loading entry
        const loadingEntry: TrailEntry<TData> = {
          key: keyOrName,
          parentKey: sourceKey,
          originalParentKey: sourceKey,
          rect,
          originalRect: rect,
          isLoading: true,
          collision: localCollision,
        };
        set((state) => pushNestedState(state, sourceIndex, loadingEntry));

        try {
          const resolved = await resultOrPromise;

          if (get().nestedHydrationRequestCounters[sourceKey] !== nextCounter) return;

          // Update cache
          if (cache && resolved !== undefined) {
            void cache.set(keyOrName, resolved as TData);
          }

          set((state) => {
            const nextTrail = state.trail.map((e) =>
              e.key === keyOrName ? { ...e, isLoading: false, data: resolved, error: null } : e,
            );
            return { trail: nextTrail };
          });
        } catch (err) {
          if (controller.signal.aborted) return;
          if (get().nestedHydrationRequestCounters[sourceKey] !== nextCounter) return;
          set((state) => {
            const nextTrail = state.trail.map((e) =>
              e.key === keyOrName
                ? {
                    ...e,
                    isLoading: false,
                    error: err instanceof Error ? err : new Error(String(err)),
                  }
                : e,
            );
            return { trail: nextTrail };
          });
        } finally {
          if (activeControllers.get(keyOrName) === controller) {
            activeControllers.delete(keyOrName);
          }
        }
      },

      retryPopover: async (key) => {
        const { floating, trail, context, cache } = get();
        const index = findEntryIndex(floating, trail, key);
        if (index === -1) return;

        const entry = getEntryAtIndex(floating, trail, index);
        if (!entry) return;

        // Abort previous loading requests for this key if any
        const prevController = activeControllers.get(key);
        if (prevController) {
          prevController.abort();
        }
        const controller = new AbortController();
        activeControllers.set(key, controller);

        let parentData: any = undefined;
        if (entry.parentKey) {
          const pIndex = findEntryIndex(floating, trail, entry.parentKey);
          if (pIndex !== -1) {
            parentData = getEntryAtIndex(floating, trail, pIndex)?.data;
          }
        }

        const resultOrPromise = resolveData(
          key,
          parentData,
          context ?? undefined,
          controller.signal,
        );

        if (!isPromise(resultOrPromise)) {
          const resolved = resultOrPromise;
          set((state) => {
            const nextTrail = state.trail.map((e) =>
              e.key === key ? { ...e, isLoading: false, data: resolved, error: null } : e,
            );
            const nextFloating = state.floating.map((e) =>
              e.key === key ? { ...e, isLoading: false, data: resolved, error: null } : e,
            );
            return { trail: nextTrail, floating: nextFloating };
          });
          if (cache && resolved !== undefined) {
            void cache.set(key, resolved as TData);
          }
          activeControllers.delete(key);
          return;
        }

        set((state) => {
          const nextTrail = state.trail.map((e) =>
            e.key === key ? { ...e, isLoading: true, error: null } : e,
          );
          const nextFloating = state.floating.map((e) =>
            e.key === key ? { ...e, isLoading: true, error: null } : e,
          );
          return { trail: nextTrail, floating: nextFloating };
        });

        try {
          const resolved = await resultOrPromise;
          if (cache && resolved !== undefined) {
            void cache.set(key, resolved as TData);
          }
          set((state) => {
            const nextTrail = state.trail.map((e) =>
              e.key === key ? { ...e, isLoading: false, data: resolved, error: null } : e,
            );
            const nextFloating = state.floating.map((e) =>
              e.key === key ? { ...e, isLoading: false, data: resolved, error: null } : e,
            );
            return { trail: nextTrail, floating: nextFloating };
          });
        } catch (err) {
          if (controller.signal.aborted) return;
          set((state) => {
            const errorObj = err instanceof Error ? err : new Error(String(err));
            const nextTrail = state.trail.map((e) =>
              e.key === key ? { ...e, isLoading: false, error: errorObj } : e,
            );
            const nextFloating = state.floating.map((e) =>
              e.key === key ? { ...e, isLoading: false, error: errorObj } : e,
            );
            return { trail: nextTrail, floating: nextFloating };
          });
        } finally {
          if (activeControllers.get(key) === controller) {
            activeControllers.delete(key);
          }
        }
      },
      destroy: () => {
        for (const controller of activeControllers.values()) {
          controller.abort();
        }
        activeControllers.clear();

        set({
          ownerId: null,
          trail: [],
          floating: [],
          offsets: {},
          pinnedStates: {},
          zIndexOrder: [],
          rootHydrationRequestCounter: 0,
          nestedHydrationRequestCounters: {},
          anchorElement: null,
          anchorRect: null,
        });
      },
      setClosePinnedDescendants: (closePinnedDescendants) => {
        set({ closePinnedDescendants });
      },
      setCollisionConfig: (collisionConfig) => {
        set({ collisionConfig });
      },
      closeByKey: (key) => {
        const { floating, trail } = get();
        const index = findEntryIndex(floating, trail, key);
        if (index !== -1) {
          actions.closeFrom(index);
        }
      },
    };

    const {
      setContext: _,
      setOwnerId: __,
      openRoot: ___,
      pushNested: ____,
      destroy: _____,
      setClosePinnedDescendants: ______,
      setCollisionConfig: _______,
      ...remainingActions
    } = actions;

    return {
      ownerId: null,
      trail: [],
      floating: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: [],
      rootHydrationRequestCounter: 0,
      nestedHydrationRequestCounters: {},
      anchorElement: null,
      anchorRect: null,
      context: initialContext ?? null,
      closePinnedDescendants: false,
      collisionConfig: null,
      cache: cache ?? null,

      ...actions,
      actions: remainingActions,
    };
  });
}
