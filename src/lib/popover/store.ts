import { createStore } from 'zustand/vanilla'
import type { PopoverStore, PopoverResolver, TrailEntry, PopoverStateData, PopoverActions } from './types'

/**
 * Checks if a value is a plain object.
 */
function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val)
}

/**
 * Filter a record object, retaining only the keys present in the allowed set.
 */
function filterRecord<T>(record: Record<string, T>, allowedKeys: Set<string>): Record<string, T> {
  const nextRecord: Record<string, T> = {}
  let changed = false
  for (const key of Object.keys(record)) {
    if (allowedKeys.has(key)) {
      nextRecord[key] = record[key]
    } else {
      changed = true
    }
  }
  return changed ? nextRecord : record
}

/**
 * Retrieves a popover entry safely using a unified index.
 */
function getEntryAtIndex<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  index: number
): TrailEntry<TData> | undefined {
  if (index < 0) return undefined
  if (index < floating.length) {
    return floating[index]
  }
  const trailIndex = index - floating.length
  return trail[trailIndex]
}

/**
 * Finds the virtual index of a popover entry by its key.
 */
function findEntryIndex(
  floating: readonly TrailEntry[],
  trail: readonly TrailEntry[],
  key: string
): number {
  const fIndex = floating.findIndex((e) => e.key === key)
  if (fIndex !== -1) return fIndex
  const tIndex = trail.findIndex((e) => e.key === key)
  if (tIndex !== -1) return floating.length + tIndex
  return -1
}

/**
 * Returns true if a popover with the given key is currently active.
 */
function hasEntryWithKey(
  floating: readonly TrailEntry[],
  trail: readonly TrailEntry[],
  key: string
): boolean {
  return floating.some((e) => e.key === key) || trail.some((e) => e.key === key)
}

/**
 * Deep equality helper to verify changes in state values.
 */
const isDeepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((val, index) => isDeepEqual(val, b[index]))
  }
  if (Array.isArray(a) || Array.isArray(b)) return false
  if (a instanceof DOMRect && b instanceof DOMRect) {
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height
  }
  if (isRecord(a) && isRecord(b)) {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    return keysA.every((k) => isDeepEqual(a[k], b[k]))
  }
  return false
}

/**
 * Calculates the updated z-index render order list, bringing the new key to the front.
 */
function getNextZIndexOrder(
  zIndexOrder: readonly string[],
  activeKeys: Set<string>,
  newKey: string
): string[] {
  return [...zIndexOrder.filter((k) => activeKeys.has(k) && k !== newKey), newKey]
}

/**
 * Retrieves all children and descendants spawned by a parent popover.
 */
function getDescendants(
  parentKey: string,
  floating: readonly TrailEntry[],
  trail: readonly TrailEntry[]
): TrailEntry[] {
  const descendants: TrailEntry[] = []
  const queue = [parentKey]
  const visited = new Set<string>([parentKey])
  const floatingKeys = new Set(floating.map((e) => e.key))

  while (queue.length > 0) {
    const current = queue.shift()
    if (current === undefined) break
    const checkEntry = (entry: TrailEntry) => {
      if (entry.parentKey === current && !visited.has(entry.key)) {
        if (floatingKeys.has(entry.key)) return
        visited.add(entry.key)
        descendants.push(entry)
        queue.push(entry.key)
      }
    }
    floating.forEach(checkEntry)
    trail.forEach(checkEntry)
  }
  return descendants
}

/**
 * Focuses a popover and drags its children trail to the top of z-index.
 */
function bringToFrontPatch<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  key: string
): Partial<PopoverStateData<TData, TContext>> {
  const descendantEntries = getDescendants(key, state.floating, state.trail)
  const keysToMove = [...descendantEntries.map((e) => e.key), key]
  const nextZIndexOrder = [
    ...state.zIndexOrder.filter((k) => !keysToMove.includes(k)),
    ...keysToMove,
  ]
  const index = state.floating.findIndex((e) => e.key === key)
  let nextFloating = state.floating

  if (index !== -1) {
    const clickedEntry = state.floating[index]
    const floatingDescendants = descendantEntries.filter((e) =>
      state.floating.some((f) => f.key === e.key)
    )
    const floatingKeysToMove = new Set<string>([key])
    for (const desc of floatingDescendants) {
      floatingKeysToMove.add(desc.key)
    }
    nextFloating = [
      ...state.floating.filter((e) => !floatingKeysToMove.has(e.key)),
      clickedEntry,
      ...floatingDescendants,
    ]
  }
  return {
    zIndexOrder: nextZIndexOrder,
    floating: nextFloating,
  }
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
  nestedHydrationRequestCounters: Record<string, number>
): Partial<PopoverStateData<TData, TContext>> {
  const activeKeys = new Set<string>()
  floating.forEach((e) => activeKeys.add(e.key))
  trail.forEach((e) => activeKeys.add(e.key))

  const nextOffsets = filterRecord(offsets, activeKeys)
  const nextZIndexOrder = zIndexOrder.filter((k) => activeKeys.has(k))
  const nextPinnedStates = filterRecord(pinnedStates, activeKeys)
  const nextNestedCounters = filterRecord(nestedHydrationRequestCounters, activeKeys)

  const patch: Partial<PopoverStateData<TData, TContext>> = {
    offsets: nextOffsets,
    zIndexOrder: nextZIndexOrder,
    pinnedStates: nextPinnedStates,
    nestedHydrationRequestCounters: nextNestedCounters,
  }
  if (floating.length === 0 && trail.length === 0) {
    patch.zIndexOrder = []
    patch.anchorElement = null
    patch.anchorRect = null
    patch.ownerId = null
  }
  return patch
}

/**
 * Builds a state patch to completely clear the trailing popover stack
 * while keeping floating popovers intact.
 */
function getClearTrailPatch<TData, TContext>(
  state: PopoverStateData<TData, TContext>
): Partial<PopoverStateData<TData, TContext>> {
  const floatingKeys = new Set(state.floating.map((e) => e.key))
  const nextNestedCounters = filterRecord(state.nestedHydrationRequestCounters, floatingKeys)
  const patch: Partial<PopoverStateData<TData, TContext>> = {
    trail: [],
    offsets: filterRecord(state.offsets, floatingKeys),
    zIndexOrder: state.zIndexOrder.filter((k) => floatingKeys.has(k)),
    anchorElement: null,
    anchorRect: null,
    nestedHydrationRequestCounters: nextNestedCounters,
  }
  if (state.floating.length === 0) {
    patch.zIndexOrder = []
    patch.ownerId = null
  }
  return patch
}

/**
 * Pure state updater for spawning/opening a new root popover.
 */
function openRootState<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  ownerId: string,
  entry: TrailEntry<TData>
): Partial<PopoverStateData<TData, TContext>> {
  const hasFloating = state.floating.some((e) => e.key === entry.key)
  if (hasFloating) {
    return bringToFrontPatch(state, entry.key)
  }
  const isSameOwner = state.ownerId === ownerId
  const nextTrail = isSameOwner ? [...state.trail, entry] : [entry]

  const activeKeys = new Set<string>()
  state.floating.forEach((e) => activeKeys.add(e.key))
  nextTrail.forEach((e) => activeKeys.add(e.key))

  return {
    ownerId,
    trail: nextTrail,
    offsets: filterRecord(state.offsets, activeKeys),
    zIndexOrder: getNextZIndexOrder(state.zIndexOrder, activeKeys, entry.key),
  }
}

/**
 * Pure state updater for pushing/opening a nested popover.
 */
function pushNestedState<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  index: number,
  entry: TrailEntry<TData>
): Partial<PopoverStateData<TData, TContext>> {
  const hasFloating = state.floating.some((e) => e.key === entry.key)
  if (hasFloating) {
    return bringToFrontPatch(state, entry.key)
  }

  const isFloating = index < state.floating.length
  let nextTrail: TrailEntry<TData>[]
  if (isFloating) {
    const floatingEntry = state.floating[index]
    if (floatingEntry.key === entry.key) return {}
    nextTrail = [entry]
  } else {
    const trailIndex = index - state.floating.length
    const parentEntry = state.trail[trailIndex]
    if (parentEntry.key === entry.key) return {}
    const finalEntry = { ...entry }
    if (finalEntry.parentKey === finalEntry.key) {
      finalEntry.parentKey = undefined
    }
    // insert trail entry after the specified index in the trail
    nextTrail = state.trail.slice(0, trailIndex + 1).concat(finalEntry)
  }

  const activeKeys = new Set<string>()
  state.floating.forEach((e) => activeKeys.add(e.key))
  nextTrail.forEach((e) => activeKeys.add(e.key))

  return {
    trail: nextTrail,
    offsets: filterRecord(state.offsets, activeKeys),
    zIndexOrder: getNextZIndexOrder(state.zIndexOrder, activeKeys, entry.key),
  }
}

/**
 * Pure state updater for toggling a popover's pinned vs trailing state.
 */
function togglePinState<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  key: string,
  rect?: DOMRect
): Partial<PopoverStateData<TData, TContext>> {
  const floatingIndex = state.floating.findIndex((e) => e.key === key)
  const wasPinned = floatingIndex !== -1
  const nextFloating = [...state.floating]
  const nextTrail = [...state.trail]
  const nextPinnedStates = { ...state.pinnedStates }
  const nextOffsets = { ...state.offsets }
  let nextZIndexOrder = [...state.zIndexOrder]

  if (!wasPinned) {
    const trailIndex = state.trail.findIndex((e) => e.key === key)
    if (trailIndex !== -1) {
      const entry = state.trail[trailIndex]
      const updatedEntry = {
        ...entry,
        rect: rect ?? entry.rect,
        pinnedLayoutPos: rect ? { top: rect.top, left: rect.left } : undefined,
        parentKey: undefined,
      }
      nextTrail.splice(trailIndex, 1)
      nextFloating.push(updatedEntry)
      nextOffsets[key] = { x: 0, y: 0 }
      nextPinnedStates[key] = true
      nextZIndexOrder = [...nextZIndexOrder.filter((k) => k !== key), key]
    }
  } else {
    nextFloating.splice(floatingIndex, 1)
    nextPinnedStates[key] = false
  }

  const cleanupPatch = getCleanupStatePatch<TData, TContext>(
    nextFloating,
    nextTrail,
    nextOffsets,
    nextZIndexOrder,
    nextPinnedStates,
    state.nestedHydrationRequestCounters
  )

  return {
    floating: nextFloating,
    trail: nextTrail,
    ...cleanupPatch,
  }
}

/**
 * Pure state updater for closing popovers starting at a target index.
 */
function closeFromState<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  index: number
): Partial<PopoverStateData<TData, TContext>> {
  const isFloating = index < state.floating.length
  const nextFloating = [...state.floating]
  let nextTrail = [...state.trail]
  const nextPinnedStates = { ...state.pinnedStates }

  if (isFloating) {
    const entry = state.floating[index]
    nextFloating.splice(index, 1)
    nextPinnedStates[entry.key] = false
    if (state.trail.length > 0 && state.trail[0].parentKey === entry.key) {
      nextTrail = []
    }
  } else {
    const trailIndex = index - state.floating.length
    nextTrail = state.trail.slice(0, trailIndex)
  }

  const cleanupPatch = getCleanupStatePatch<TData, TContext>(
    nextFloating,
    nextTrail,
    state.offsets,
    state.zIndexOrder,
    nextPinnedStates,
    state.nestedHydrationRequestCounters
  )

  return {
    floating: nextFloating,
    trail: nextTrail,
    ...cleanupPatch,
  }
}

/**
 * Creates the generic Zustand popover store.
 */
export function createPopoverStore<TData = any, TContext = any>(
  resolveData: PopoverResolver<TData, TContext>,
  initialContext?: TContext
) {
  return createStore<PopoverStore<TData, TContext>>((set, get) => {
    const actions: PopoverActions<TData, TContext> = {
      setContext: (context) => {
        if (!isDeepEqual(get().context, context)) {
          set({ context })
        }
      },

      setOwnerId: (ownerId) => {
        if (get().ownerId !== ownerId) {
          set({ ownerId })
        }
      },

      openRoot: (ownerId, entry) => {
        set((state) => openRootState(state, ownerId, entry))
      },

      pushNested: (index, entry) => {
        set((state) => pushNestedState(state, index, entry))
      },

      togglePin: (key, rect) => {
        set((state) => togglePinState(state, key, rect))
      },

      bringToFront: (key) => {
        set((state) => {
          if (!hasEntryWithKey(state.floating, state.trail, key)) return {}
          return bringToFrontPatch(state, key)
        })
      },

      closeFrom: (index) => {
        set((state) => closeFromState(state, index))
      },

      updateOffset: (key, x, y) => {
        set((state) => ({
          offsets: {
            ...state.offsets,
            [key]: { x, y },
          },
        }))
      },

      clear: () => {
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
        })
      },

      clearTrail: () => {
        set((state) => getClearTrailPatch(state))
      },

      // Async/Hydration Actions
      openRootWithResolver: async (keyOrName, anchorEvent, ownerIdOverride) => {
        anchorEvent.stopPropagation()
        const { ownerId, context, rootHydrationRequestCounter } = get()
        const finalOwnerId = ownerIdOverride ?? ownerId ?? 'default'

        const anchorElement = anchorEvent.currentTarget
        const anchorRect = anchorElement.getBoundingClientRect()
        
        // Save anchor details immediately
        set({ anchorElement, anchorRect })

        const nextCounter = rootHydrationRequestCounter + 1
        set({ rootHydrationRequestCounter: nextCounter })

        // Pre-create loading entry
        const loadingEntry: TrailEntry<TData> = {
          key: keyOrName,
          rect: anchorRect,
          isLoading: true,
        }
        set((state) => openRootState(state, finalOwnerId, loadingEntry))

        try {
          const resolved = await resolveData(keyOrName, undefined, context ?? undefined)
          
          // Verify we aren't handling a stale response
          if (get().rootHydrationRequestCounter !== nextCounter) return

          // Update data
          set((state) => {
            const nextTrail = state.trail.map((e) =>
              e.key === keyOrName ? { ...e, isLoading: false, data: resolved, error: null } : e
            )
            return { trail: nextTrail }
          })
        } catch (err) {
          if (get().rootHydrationRequestCounter !== nextCounter) return
          set((state) => {
            const nextTrail = state.trail.map((e) =>
              e.key === keyOrName
                ? { ...e, isLoading: false, error: err instanceof Error ? err : new Error(String(err)) }
                : e
            )
            return { trail: nextTrail }
          })
        }
      },

      openNestedWithResolver: async (keyOrName, sourceKey, triggerRect) => {
        const { floating, trail, context, nestedHydrationRequestCounters } = get()
        const sourceIndex = findEntryIndex(floating, trail, sourceKey)
        if (sourceIndex === -1) return

        const sourceEntry = getEntryAtIndex(floating, trail, sourceIndex)
        if (!sourceEntry) return

        const nextCounter = (nestedHydrationRequestCounters[sourceKey] ?? 0) + 1
        set((state) => ({
          nestedHydrationRequestCounters: {
            ...state.nestedHydrationRequestCounters,
            [sourceKey]: nextCounter,
          },
        }))

        // Pre-create loading entry
        const rect = triggerRect ?? sourceEntry.rect
        const loadingEntry: TrailEntry<TData> = {
          key: keyOrName,
          parentKey: sourceKey,
          rect,
          isLoading: true,
        }
        set((state) => pushNestedState(state, sourceIndex, loadingEntry))

        try {
          const resolved = await resolveData(keyOrName, sourceEntry.data, context ?? undefined)
          
          if (get().nestedHydrationRequestCounters[sourceKey] !== nextCounter) return

          set((state) => {
            const nextTrail = state.trail.map((e) =>
              e.key === keyOrName ? { ...e, isLoading: false, data: resolved, error: null } : e
            )
            return { trail: nextTrail }
          })
        } catch (err) {
          if (get().nestedHydrationRequestCounters[sourceKey] !== nextCounter) return
          set((state) => {
            const nextTrail = state.trail.map((e) =>
              e.key === keyOrName
                ? { ...e, isLoading: false, error: err instanceof Error ? err : new Error(String(err)) }
                : e
            )
            return { trail: nextTrail }
          })
        }
      },
    }

    const { setContext: _, setOwnerId: __, openRoot: ___, pushNested: ____, ...remainingActions } = actions

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

      ...actions,
      actions: remainingActions,
    }
  })
}
