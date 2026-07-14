import { createStore } from 'zustand/vanilla';
import type {
  PopoverStore,
  PopoverResolver,
  TrailEntry,
  PopoverStateData,
  PopoverActions,
  PopoverCache,
  OpenRootOptions,
  OpenNestedOptions,
} from './types';
import equal from 'fast-deep-equal';

/**
 * Type guard to determine if a value is a Promise or a thenable object.
 *
 * @template T - The resolved value type of the promise.
 * @param value - The value to inspect.
 * @returns True if the value is a promise-like object.
 */
function isPromise<T>(value: unknown): value is Promise<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).then === 'function'
  );
}

/**
 * Filters a Record object, retaining only the keys present in the specified Set.
 * Returns the original record reference if no keys were deleted to optimize rendering comparison.
 *
 * @template T - The record value type.
 * @param record - The source record to filter.
 * @param allowedKeys - The set of keys to preserve.
 * @returns The filtered record copy, or the original record.
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
 * Retrieves a popover entry safely using a virtual index that merges
 * the floating and trailing lists.
 *
 * @template TData - The resolved data payload type.
 * @param floating - The array of floating popovers.
 * @param trail - The array of trailing popovers.
 * @param index - The virtual index to query.
 * @returns The matching TrailEntry, or undefined if the index is out of bounds.
 */
function getEntryAtIndex<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  index: number,
): TrailEntry<TData> | undefined {
  return [...floating, ...trail][index];
}

/**
 * Finds the virtual index of a popover entry by its unique key ID,
 * combining the floating and trailing array ranges.
 *
 * @template TData - The resolved data payload type.
 * @param floating - The array of floating popovers.
 * @param trail - The array of trailing popovers.
 * @param key - The unique key of the popover card.
 * @returns The virtual index, or -1 if the key is not active.
 */
function findEntryIndex<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  key: string,
): number {
  return [...floating, ...trail].findIndex((e) => e.key === key);
}

/**
 * Verifies if a popover with the given key is currently active
 * in either the floating or trailing arrays.
 *
 * @template TData - The resolved data payload type.
 * @param floating - The array of floating popovers.
 * @param trail - The array of trailing popovers.
 * @param key - The unique key of the popover card.
 * @returns True if the popover is active.
 */
function hasEntryWithKey<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  key: string,
): boolean {
  return [...floating, ...trail].some((e) => e.key === key);
}

/**
 * Calculates the updated z-index depth order list, moving the specified key to the top (end)
 * and filtering out any obsolete keys.
 *
 * @param zIndexOrder - The current z-index depth order list.
 * @param activeKeys - The set of currently active popover keys.
 * @param newKey - The key to bring to the topmost stack depth.
 * @returns The updated z-index order array.
 */
function getNextZIndexOrder(
  zIndexOrder: readonly string[],
  activeKeys: Set<string>,
  newKey: string,
): string[] {
  return [...zIndexOrder.filter((k) => activeKeys.has(k) && k !== newKey), newKey];
}

/**
 * Helper to collect all active popover keys from floating and trail arrays.
 *
 * @template TData - The resolved data payload type.
 * @param floating - The array of floating popovers.
 * @param trail - The array of trailing popovers.
 * @returns A Set containing all active popover keys.
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
 * Builds a Map grouping popovers by their parent key IDs.
 *
 * @template TData - The resolved data payload type.
 * @param floating - The array of floating popovers.
 * @param trail - The array of trailing popovers.
 * @param useOriginalParent - Optional flag to group by originalParentKey fallback.
 * @returns A Map mapping parent keys to arrays of child entries.
 */
function buildChildrenMap<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  useOriginalParent = false,
): Map<string, TrailEntry<TData>[]> {
  const childrenMap = new Map<string, TrailEntry<TData>[]>();
  const mapEntry = (entry: TrailEntry<TData>) => {
    const pKey = useOriginalParent ? (entry.parentKey ?? entry.originalParentKey) : entry.parentKey;
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
  return childrenMap;
}

/**
 * Unified pointer-based BFS descendants traverser.
 *
 * @template TData - The resolved data payload type.
 * @param startKeys - The start keys for BFS traversal.
 * @param floating - The array of floating popovers.
 * @param trail - The array of trailing popovers.
 * @param options - Traversal options (useOriginalParent / ignoreFloating).
 * @returns Array of found descendant popovers.
 */
function traverseDescendants<TData>(
  startKeys: readonly string[],
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  options: {
    useOriginalParent?: boolean;
    ignoreFloating?: boolean;
  } = {},
): TrailEntry<TData>[] {
  const { useOriginalParent = false, ignoreFloating = false } = options;
  const childrenMap = buildChildrenMap(floating, trail, useOriginalParent);
  const descendants: TrailEntry<TData>[] = [];
  const queue = [...startKeys];
  const visited = new Set<string>(startKeys);
  const floatingKeys = ignoreFloating ? new Set(floating.map((e) => e.key)) : null;

  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    const children = childrenMap.get(current);
    if (children) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!visited.has(child.key)) {
          if (floatingKeys && floatingKeys.has(child.key)) {
            continue;
          }
          visited.add(child.key);
          descendants.push(child);
          queue.push(child.key);
        }
      }
    }
  }
  return descendants;
}

function getDescendants<TData>(
  parentKey: string,
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
): TrailEntry<TData>[] {
  return traverseDescendants([parentKey], floating, trail, {
    useOriginalParent: false,
    ignoreFloating: true,
  });
}

/**
 * Recursively retrieves all descendant keys (both trailing and floating) spawned by a parent popover key.
 * Traverses parent-child linkages via both current parentKey and originalParentKey.
 *
 * @template TData - The resolved data payload type.
 * @param parentKeys - The parent key(s) to start the descendant traversal.
 * @param floating - The array of floating popovers.
 * @param trail - The array of trailing popovers.
 * @returns A Set containing all descendant popover key IDs.
 */
function getAllDescendants<TData>(
  parentKeys: string[],
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
): Set<string> {
  const descendants = traverseDescendants(parentKeys, floating, trail, {
    useOriginalParent: true,
    ignoreFloating: false,
  });
  return new Set(descendants.map((d) => d.key));
}

/**
 * Returns a state patch that brings the targeted popover card and all of its trail descendants
 * to the top of the z-index depth stack.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - The shared context type.
 * @param state - The current popover state data.
 * @param key - The target popover key.
 * @returns State patch updating zIndexOrder and floating arrays.
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
    const floatingKeysToMove = new Set<string>([key, ...floatingDescendants.map((d) => d.key)]);
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
 * Builds a clean state patch pruning coordinate offsets, z-index orders,
 * pinned states, and pending request counters for any obsolete keys.
 * Also immediately clears root trigger anchors if the active trail becomes empty.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - The shared context type.
 * @param floating - The list of floating popovers.
 * @param trail - The active trail stack.
 * @param offsets - Current drag coordinate offsets record.
 * @param zIndexOrder - Current depth stacking list.
 * @param pinnedStates - Current pinning flags record.
 * @param nestedHydrationRequestCounters - Stale-resolver request counters.
 * @returns State patch updating tracking records.
 */
function getCleanupStatePatch<TData, TContext>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  offsets: Record<string, { x: number; y: number }>,
  zIndexOrder: string[],
  pinnedStates: Record<string, boolean>,
  nestedHydrationRequestCounters: Record<string, number>,
): Partial<PopoverStateData<TData, TContext>> {
  const activeKeys = getActiveKeys(floating, trail);

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
 * Pure state updater for spawning or opening a new root popover.
 * Resets the active trail if ownerId changes, otherwise appends it.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - The shared context type.
 * @param state - The current Zustand store state.
 * @param ownerId - The owner identifier claiming the new root.
 * @param entry - The root TrailEntry to insert.
 * @returns State patch spawning the root.
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
 * Resolves child insertions next to their parent indices and slices any downstream trail branches.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - The shared context type.
 * @param state - The current Zustand store state.
 * @param index - The parent popover's virtual index.
 * @param entry - The nested TrailEntry to insert.
 * @returns State patch appending the child card.
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

  const activeKeys = getActiveKeys(state.floating, nextTrail);

  return {
    trail: nextTrail,
    offsets: filterRecord(state.offsets, activeKeys),
    zIndexOrder: getNextZIndexOrder(state.zIndexOrder, activeKeys, entry.key),
  };
}

/**
 * Pure state updater for toggling a popover's modeless pinned/floating vs trailing status.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - The shared context type.
 * @param state - The current Zustand store state.
 * @param key - The target popover card key.
 * @param rect - The immediate viewport-relative bounding box of the card.
 * @returns State patch toggling pinned status.
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
 * Pure state updater for closing popovers starting at a target virtual index,
 * recursively cleaning up descendant branches based on provider configurations.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - The shared context type.
 * @param state - The current Zustand store state.
 * @param index - The virtual index starting the closure range.
 * @returns State patch cleaning up closed keys.
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
 * Instantiates and returns a generic Zustand vanilla StoreApi instance.
 * Coordinates trail linkages, floating/pinned states, drag offsets, stacking order,
 * active loaders, and abort controllers.
 *
 * @remarks
 * Keeps AbortControllers in a private local Map closed over by actions to ensure
 * they are completely isolated from React rendering lifecycles and GC safely.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - The shared context type.
 * @param resolveData - The active data resolver callback.
 * @param initialContext - Optional initial context values.
 * @param cache - Optional synchronous/asynchronous cache provider.
 * @returns A Zustand StoreApi instance matching PopoverStore.
 */
export function createPopoverStore<TData = unknown, TContext = unknown>(
  resolveData: PopoverResolver<TData, TContext>,
  initialContext?: TContext,
  cache?: PopoverCache<TData>,
) {
  const activeControllers = new Map<string, AbortController>();
  const hoverCloseTimers = new Map<string, ReturnType<typeof setTimeout>>();

  const abortControllersForKeys = (keys: Iterable<string>) => {
    for (const key of keys) {
      const controller = activeControllers.get(key);
      if (controller) {
        controller.abort();
        activeControllers.delete(key);
      }
    }
  };

  const clearHoverTimer = (key: string) => {
    const timer = hoverCloseTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      hoverCloseTimers.delete(key);
    }
  };

  return createStore<PopoverStore<TData, TContext>>((rawSet, get) => {
    const set = (
      patchOrFn:
        | Partial<PopoverStore<TData, TContext>>
        | ((state: PopoverStore<TData, TContext>) => Partial<PopoverStore<TData, TContext>>),
    ) => {
      const debug = get()?.debug;
      rawSet((state: PopoverStore<TData, TContext>) => {
        const patch = typeof patchOrFn === 'function' ? patchOrFn(state) : patchOrFn;
        if (debug) {
          console.group(`Popover Store Update [${new Date().toLocaleTimeString()}]`);
          console.log('State Patch:', patch);
        }
        const nextState = { ...state, ...patch };
        if (debug) {
          console.log('Next State:', nextState);
          console.groupEnd();
        }
        return patch;
      });
    };

    const resetStoreState = () => {
      for (const controller of activeControllers.values()) {
        controller.abort();
      }
      activeControllers.clear();

      for (const timer of hoverCloseTimers.values()) {
        clearTimeout(timer);
      }
      hoverCloseTimers.clear();

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
    };

    const incrementRootCounter = () => {
      const next = get().rootHydrationRequestCounter + 1;
      set({ rootHydrationRequestCounter: next });
      return next;
    };

    const isRootStale = (startedCounter: number) =>
      get().rootHydrationRequestCounter !== startedCounter;

    const incrementNestedCounter = (parentKey: string) => {
      const next = (get().nestedHydrationRequestCounters[parentKey] ?? 0) + 1;
      set((state) => ({
        nestedHydrationRequestCounters: {
          ...state.nestedHydrationRequestCounters,
          [parentKey]: next,
        },
      }));
      return next;
    };

    const isNestedStale = (parentKey: string, startedCounter: number) =>
      get().nestedHydrationRequestCounters[parentKey] !== startedCounter;

    const getUpdateEntryStatePatch = (
      key: string,
      updatedFields: Partial<TrailEntry<TData>>,
    ) => (state: PopoverStateData<TData, TContext>) => {
      const update = (e: TrailEntry<TData>) => (e.key === key ? { ...e, ...updatedFields } : e);
      return {
        trail: state.trail.map(update),
        floating: state.floating.map(update),
      };
    };

    const resolvePopoverEntry = async (
      key: string,
      parentKey: string | undefined,
      rect: DOMRect | null,
      parentData: TData | undefined,
      options: (OpenRootOptions & OpenNestedOptions) | undefined,
      controllerKey: string,
      incrementCounter: () => number,
      isStale: (counter: number) => boolean,
      insertStatePatch: (
        entry: TrailEntry<TData>,
      ) =>
        | Partial<PopoverStore<TData, TContext>>
        | ((state: PopoverStore<TData, TContext>) => Partial<PopoverStore<TData, TContext>>),
    ): Promise<void> => {
      abortControllersForKeys([controllerKey]);
      const controller = new AbortController();
      activeControllers.set(controllerKey, controller);

      const localCollision = options?.collision;
      const { cache: storeCache, context } = get();

      const buildEntry = (
        data?: TData,
        error?: Error | null,
        isLoading = false,
      ): TrailEntry<TData> => ({
        key,
        parentKey,
        originalParentKey: parentKey,
        rect: rect ?? undefined,
        originalRect: rect ?? undefined,
        data,
        error,
        isLoading,
        collision: localCollision,
        hover: options?.hover,
        ariaDescribedby: options?.ariaDescribedby,
        allowDragWhenUnpinned: options?.allowDragWhenUnpinned,
      });

      const updateEntryStateInLists = (patch: Partial<TrailEntry<TData>>) => {
        set((state) => {
          const update = (e: TrailEntry<TData>) => (e.key === key ? { ...e, ...patch } : e);
          return {
            trail: state.trail.map(update),
            floating: state.floating.map(update),
          };
        });
      };

      const cached = storeCache?.get(key);
      if (cached !== undefined && !isPromise<TData>(cached)) {
        set(insertStatePatch(buildEntry(cached as TData | undefined)));
        activeControllers.delete(controllerKey);
        return;
      }

      let resultOrPromise: Promise<TData> | TData | undefined;
      try {
        resultOrPromise =
          cached !== undefined
            ? (cached as Promise<TData> | TData)
            : get().resolveData(key, parentData, context ?? undefined, controller.signal);
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        set(insertStatePatch(buildEntry(undefined, errorObj)));
        activeControllers.delete(controllerKey);
        return;
      }

      if (!isPromise<TData>(resultOrPromise)) {
        set(insertStatePatch(buildEntry(resultOrPromise)));
        if (storeCache && resultOrPromise !== undefined) {
          void storeCache.set(key, resultOrPromise);
        }
        activeControllers.delete(controllerKey);
        return;
      }

      const startedCounter = incrementCounter();
      set(insertStatePatch(buildEntry(undefined, null, true)));

      try {
        const resolved = await resultOrPromise;
        if (controller.signal.aborted || isStale(startedCounter)) return;

        if (storeCache && resolved !== undefined) {
          void storeCache.set(key, resolved);
        }

        updateEntryStateInLists({ isLoading: false, data: resolved, error: null });
      } catch (err) {
        if (controller.signal.aborted || isStale(startedCounter)) return;
        const errorObj = err instanceof Error ? err : new Error(String(err));

        updateEntryStateInLists({ isLoading: false, error: errorObj });
      } finally {
        if (activeControllers.get(controllerKey) === controller) {
          activeControllers.delete(controllerKey);
        }
      }
    };

    const actions: PopoverActions<TData, TContext> = {
      setContext: (context) => {
        if (!equal(get().context, context)) {
          set({ context });
        }
      },

      setResolveData: (resolveData) => {
        set({ resolveData });
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

          abortControllersForKeys(removedKeys);
        }
        set((state) => closeFromState(state, index));
      },

      updateOffset: (key, x, y) => {
        const current = get().offsets[key];
        if (current && current.x === x && current.y === y) return;
        set((state) => ({
          offsets: {
            ...state.offsets,
            [key]: { x, y },
          },
        }));
      },

      clear: () => {
        resetStoreState();
      },

      clearTrail: () => {
        // Abort the root hydration request and any trail-related nested requests
        const rootController = activeControllers.get('__root__');
        if (rootController) {
          rootController.abort();
          activeControllers.delete('__root__');
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

        abortControllersForKeys(removedKeys);

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
        const { ownerId, trail } = get();
        const finalOwnerId = options?.ownerId ?? ownerId ?? 'default';

        // Check if already open as root of active trail
        if (trail.length > 0 && trail[0].key === keyOrName && get().ownerId === finalOwnerId) {
          return;
        }

        const anchorElement = anchorEvent.currentTarget;
        const anchorRect = anchorElement.getBoundingClientRect();

        // Save anchor details immediately
        set({ anchorElement, anchorRect });

        await resolvePopoverEntry(
          keyOrName,
          undefined,
          anchorRect,
          undefined,
          options,
          '__root__',
          incrementRootCounter,
          isRootStale,
          (entry) => (state) => openRootState(state, finalOwnerId, entry),
        );
      },

      openNestedWithResolver: async (keyOrName, sourceKey, options) => {
        const { floating, trail } = get();
        const sourceIndex = findEntryIndex(floating, trail, sourceKey);
        if (sourceIndex === -1) return;

        // Check if already open as direct child of sourceKey
        const existingIndex = findEntryIndex(floating, trail, keyOrName);
        if (existingIndex !== -1) {
          const existingEntry = getEntryAtIndex(floating, trail, existingIndex);
          if (existingEntry && existingEntry.parentKey === sourceKey) {
            return;
          }
        }

        const sourceEntry = getEntryAtIndex(floating, trail, sourceIndex);
        if (!sourceEntry) return;

        const triggerRect = options?.triggerRect;
        const rect = triggerRect ?? sourceEntry.rect;

        await resolvePopoverEntry(
          keyOrName,
          sourceKey,
          rect ?? null,
          sourceEntry.data,
          options,
          keyOrName,
          () => incrementNestedCounter(sourceKey),
          (startedCounter) => isNestedStale(sourceKey, startedCounter),
          (entry) => (state) => pushNestedState(state, sourceIndex, entry),
        );
      },

      retryPopover: async (key) => {
        const { floating, trail } = get();
        const index = findEntryIndex(floating, trail, key);
        if (index === -1) return;

        const entry = getEntryAtIndex(floating, trail, index);
        if (!entry) return;

        let parentData: TData | undefined = undefined;
        if (entry.parentKey) {
          const pIndex = findEntryIndex(floating, trail, entry.parentKey);
          if (pIndex !== -1) {
            parentData = getEntryAtIndex(floating, trail, pIndex)?.data;
          }
        }

        const options = {
          collision: entry.collision,
          hover: entry.hover,
          ariaDescribedby: entry.ariaDescribedby,
          allowDragWhenUnpinned: entry.allowDragWhenUnpinned,
        };

        if (entry.parentKey) {
          await resolvePopoverEntry(
            key,
            entry.parentKey,
            entry.rect ?? null,
            parentData,
            options,
            key,
            () => incrementNestedCounter(entry.parentKey!),
            (startedCounter) => isNestedStale(entry.parentKey!, startedCounter),
            (updatedEntry) => getUpdateEntryStatePatch(key, updatedEntry),
          );
        } else {
          await resolvePopoverEntry(
            key,
            undefined,
            entry.rect ?? null,
            undefined,
            options,
            '__root__',
            incrementRootCounter,
            isRootStale,
            (updatedEntry) => getUpdateEntryStatePatch(key, updatedEntry),
          );
        }
      },
      destroy: () => {
        resetStoreState();
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
      setEnableArrowNavigation: (enableArrowNavigation) => {
        set({ enableArrowNavigation });
      },
      setDebug: (debug) => {
        set({ debug });
      },
      hoverEnter: (key) => {
        clearHoverTimer(key);
        const { trail, floating } = get();
        let currentKey: string | undefined = key;
        while (currentKey) {
          const entryIndex: number = findEntryIndex(floating, trail, currentKey);
          if (entryIndex === -1) break;
          const entry: TrailEntry<TData> | undefined = getEntryAtIndex(floating, trail, entryIndex);
          if (entry && entry.parentKey) {
            clearHoverTimer(entry.parentKey);
            currentKey = entry.parentKey;
          } else {
            break;
          }
        }
      },
      hoverLeave: (key, delay = 300) => {
        clearHoverTimer(key);
        const newTimer = setTimeout(() => {
          actions.closeByKey(key);
          hoverCloseTimers.delete(key);
        }, delay);
        hoverCloseTimers.set(key, newTimer);
      },
      setCascadeOffsetStep: (cascadeOffsetStep) => {
        set({ cascadeOffsetStep });
      },
    };

    const remainingActions = { ...actions } as Record<string, unknown>;
    const internalKeys = [
      'setContext',
      'setResolveData',
      'setOwnerId',
      'openRoot',
      'pushNested',
      'destroy',
      'setClosePinnedDescendants',
      'setCollisionConfig',
      'setEnableArrowNavigation',
      'setDebug',
      'setCascadeOffsetStep',
    ];
    for (const key of internalKeys) {
      delete remainingActions[key];
    }

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
      resolveData,
      enableArrowNavigation: false,
      debug: false,
      cascadeOffsetStep: 8,

      ...actions,
      actions: remainingActions as unknown as PopoverStore<TData, TContext>['actions'],
    };
  });
}
