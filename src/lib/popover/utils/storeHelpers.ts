import type { TrailEntry, PopoverStateData } from '../types';

/**
 * Type guard to determine if a value is a Promise or a thenable object.
 *
 * @template T - The resolved value type of the promise.
 * @param value - The value to inspect.
 * @returns True if the value is a promise-like object.
 */
export function isPromise<T>(value: unknown): value is Promise<T> {
  return (
    ((typeof value === 'object' && value !== null) || typeof value === 'function') &&
    typeof (value as Record<string, unknown>).then === 'function'
  );
}

export function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
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
  const keys = Object.keys(record);
  if (keys.length === 0) return record;
  const nextRecord: Record<string, T> = {};
  let changed = false;
  for (const key of keys) {
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
 * Retrieves a popover entry safely using a virtual index that merges
 * the floating and trailing lists.
 *
 * @template TData - The resolved data payload type.
 * @param floating - The array of floating popovers.
 * @param trail - The array of trailing popovers.
 * @param index - The virtual index to query.
 * @returns The matching TrailEntry, or undefined if the index is out of bounds.
 */
export function getEntryAtIndex<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  index: number,
): TrailEntry<TData> | undefined {
  if (index < floating.length) return floating[index];
  return trail[index - floating.length];
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
export function findEntryIndex<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  key: string,
): number {
  const fi = floating.findIndex((e) => e.key === key);
  if (fi !== -1) return fi;
  const ti = trail.findIndex((e) => e.key === key);
  return ti !== -1 ? floating.length + ti : -1;
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
export function hasEntryWithKey<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  key: string,
): boolean {
  return floating.some((e) => e.key === key) || trail.some((e) => e.key === key);
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
    const parentKeys = new Set<string>();
    if (entry.parentKey) parentKeys.add(entry.parentKey);
    if (useOriginalParent && entry.originalParentKey) parentKeys.add(entry.originalParentKey);

    for (const pKey of parentKeys) {
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
  if (startKeys.length === 0) return [];
  const { useOriginalParent = false, ignoreFloating = false } = options;
  const childrenMap = buildChildrenMap(floating, trail, useOriginalParent);
  const descendants: TrailEntry<TData>[] = [];
  const queue = [...startKeys];
  const visited = new Set<string>(startKeys);
  const floatingKeys = ignoreFloating ? new Set(floating.map((e) => e.key)) : null;

  const MAX_TRAVERSAL_NODES = 500;
  let head = 0;
  while (head < queue.length && descendants.length < MAX_TRAVERSAL_NODES) {
    const current = queue[head++];
    if (!current) continue;
    const children = childrenMap.get(current);
    if (children) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child && !visited.has(child.key)) {
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
    useOriginalParent: true,
    ignoreFloating: false,
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
export function getAllDescendants<TData>(
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
 * Updates a single entry in either floating or trail array while preserving
 * referential identity for the array that was NOT modified.
 */
export function updateEntryInLists<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  key: string,
  updatedFields: Partial<TrailEntry<TData>>,
): { floating: readonly TrailEntry<TData>[]; trail: readonly TrailEntry<TData>[] } {
  let floatingChanged = false;
  const nextFloating = floating.map((e) => {
    if (e.key === key) {
      floatingChanged = true;
      return { ...e, ...updatedFields };
    }
    return e;
  });

  if (floatingChanged) {
    return { floating: nextFloating, trail };
  }

  let trailChanged = false;
  const nextTrail = trail.map((e) => {
    if (e.key === key) {
      trailChanged = true;
      return { ...e, ...updatedFields };
    }
    return e;
  });

  if (trailChanged) {
    return { floating, trail: nextTrail };
  }

  return { floating, trail };
}

/**
 * Returns a state patch that brings the targeted popover card and all of its trail descendants
 * to the top of the z-index depth stack.
 */
export function bringToFrontPatch<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  key: string,
): Partial<PopoverStateData<TData, TContext>> {
  const descendantEntries = getDescendants(key, state.floating, state.trail);
  const keysToMove = [key, ...descendantEntries.map((e) => e.key)];
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
    const clickedSlice: readonly TrailEntry<TData>[] = clickedEntry ? [clickedEntry] : [];
    nextFloating = [
      ...state.floating.filter((e) => !floatingKeysToMove.has(e.key)),
      ...clickedSlice,
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
 * Safely searches for a TrailEntry by key across both floating and trailing lists.
 */
export function findEntryInStore<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  key: string,
): TrailEntry<TData> | undefined {
  return floating.find((e) => e.key === key) ?? trail.find((e) => e.key === key);
}

/**
 * Pure helper for producing clean structural state updates without verbose spreading.
 */
export function produceTrailState<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  patch: Partial<PopoverStateData<TData, TContext>>,
): PopoverStateData<TData, TContext> {
  return {
    ...state,
    ...patch,
  };
}

/**
 * Safely partitions the trail array at target index, preserving referential equality
 * if no items are truncated.
 */
export function splitTrailAtIndex<TData>(
  trail: readonly TrailEntry<TData>[],
  index: number,
): readonly TrailEntry<TData>[] {
  if (index >= trail.length - 1) return trail;
  return trail.slice(0, index + 1);
}

/**
 * Compares two arrays for shallow element equality.
 */
export function shallowArrayEqual<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Sanitizes a numeric coordinate value, defaulting NaN to 0.
 */
export function sanitizeNum(val: number): number {
  return Number.isNaN(val) ? 0 : val;
}

/**
 * Sanitizes a DOMRect or DOMRectReadOnly object, ensuring valid numeric properties.
 */
export function sanitizeRect(
  rawRect: { x?: number; y?: number; width?: number; height?: number } | null | undefined,
): DOMRect | null {
  if (!rawRect) return null;
  return new DOMRect(
    sanitizeNum(rawRect.x ?? 0),
    sanitizeNum(rawRect.y ?? 0),
    sanitizeNum(rawRect.width ?? 0),
    sanitizeNum(rawRect.height ?? 0),
  );
}

/**
 * Constructs a fully initialized TrailEntry object with defaulted fallbacks.
 */
export function createTrailEntry<TData>(
  key: string,
  parentKey: string | undefined,
  rect: DOMRect | null,
  options: (import('../types').OpenRootOptions & import('../types').OpenNestedOptions) | undefined,
  existingEntry?: TrailEntry<TData>,
  data?: TData,
  error: Error | null = null,
  isLoading = false,
): TrailEntry<TData> {
  return {
    key,
    parentKey,
    originalParentKey: parentKey ?? existingEntry?.originalParentKey,
    rect: rect ?? existingEntry?.rect,
    originalRect: rect ?? existingEntry?.originalRect,
    data,
    error,
    isLoading,
    collision: options?.collision,
    transitionStatus: 'mounting',
    hover: options?.hover,
    ariaDescribedby: options?.ariaDescribedby,
    allowDragWhenPinned: options?.allowDragWhenPinned,
    allowDragWhenUnpinned: options?.allowDragWhenUnpinned,
    placement: options?.placement,
    offset: options?.offset,
    exitTransitionDuration: options?.exitTransitionDuration,
    baseZIndex: options?.baseZIndex,
    cascadeOffsetStep: options?.cascadeOffsetStep,
    cascadeOffsetDirection: options?.cascadeOffsetDirection,
    enableTilt: options?.enableTilt,
    maxTiltAngle: options?.maxTiltAngle,
    tiltSensitivity: options?.tiltSensitivity,
    dragAxis: options?.dragAxis,
    tiltFriction: options?.tiltFriction,
    tiltDecay: options?.tiltDecay,
    mountingClassName: options?.mountingClassName,
    unmountingClassName: options?.unmountingClassName,
    mountedClassName: options?.mountedClassName,
    buttonControls: options?.buttonControls ?? existingEntry?.buttonControls,
    stackGroup: options?.stackGroup ?? existingEntry?.stackGroup,
    responsiveMode: options?.responsiveMode ?? existingEntry?.responsiveMode,
    layoutStrategy: options?.layoutStrategy ?? existingEntry?.layoutStrategy,
    keyboardShortcuts: options?.keyboardShortcuts ?? existingEntry?.keyboardShortcuts,
    focusLockOptions: options?.focusLockOptions ?? existingEntry?.focusLockOptions,
    onOpen: options?.onOpen ?? existingEntry?.onOpen,
    onClose: options?.onClose ?? existingEntry?.onClose,
    onPin: options?.onPin ?? existingEntry?.onPin,
    onError: options?.onError ?? existingEntry?.onError,
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
