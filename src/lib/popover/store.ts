import { createStore } from 'zustand/vanilla';
import type {
  PopoverStore,
  PopoverResolver,
  TrailEntry,
  PopoverActions,
  PopoverCache,
  OpenRootOptions,
  OpenNestedOptions,
} from './types';
import equal from 'fast-deep-equal';
import {
  isPromise,
  getEntryAtIndex,
  findEntryIndex,
  hasEntryWithKey,
  getAllDescendants,
  bringToFrontPatch,
  getCleanupStatePatch,
  openRootState,
  pushNestedState,
  togglePinState,
  closeFromState,
  updateEntryInLists,
} from './utils/storeHelpers';

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
export function createPopoverStore<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  resolveData: PopoverResolver<TData, TContext>,
  initialContext?: TContext,
  cache?: PopoverCache<TData>,
) {
  const activeControllers = new Map<string, AbortController>();
  const inFlightPromises = new Map<string, Promise<TData>>();
  const hoverCloseTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const transitionTimers = new Map<string, ReturnType<typeof setTimeout>>();

  const eventListeners = new Set<(event: import('./types').PopoverStoreEvent<TData>) => void>();
  const middlewares = new Set<import('./types').PopoverMiddleware<TData, TContext, TPopoverKey>>();
  let isBatching = false;
  let batchedStatePatch: Partial<PopoverStore<TData, TContext, TPopoverKey>> = {};

  type HistorySnapshot = {
    trail: readonly TrailEntry<TData>[];
    floating: readonly TrailEntry<TData>[];
    offsets: Readonly<Record<string, Readonly<{ x: number; y: number }>>>;
    pinnedStates: Readonly<Record<string, boolean>>;
    zIndexOrder: readonly string[];
    ownerId: string | null;
  };

  const undoStack: HistorySnapshot[] = [];
  const redoStack: HistorySnapshot[] = [];
  const MAX_HISTORY = 30;

  const pushSnapshot = (state: PopoverStore<TData, TContext, TPopoverKey>) => {
    if (undoStack.length >= MAX_HISTORY) {
      undoStack.shift();
    }
    undoStack.push({
      trail: state.trail,
      floating: state.floating,
      offsets: state.offsets,
      pinnedStates: state.pinnedStates,
      zIndexOrder: state.zIndexOrder,
      ownerId: state.ownerId,
    });
    redoStack.length = 0;
  };

  const emitEvent = (event: import('./types').PopoverStoreEvent<TData>) => {
    for (const listener of eventListeners) {
      try {
        listener(event);
      } catch {
        // Prevent event listener errors from disrupting store operations
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

  const clearTransitionTimer = (key: string) => {
    const timer = transitionTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      transitionTimers.delete(key);
    }
  };

  const abortControllersForKeys = (keys: Iterable<string>) => {
    for (const key of keys) {
      const controller = activeControllers.get(key);
      if (controller) {
        controller.abort();
        activeControllers.delete(key);
      }
      inFlightPromises.delete(key);
      clearHoverTimer(key);
      clearTransitionTimer(key);
    }
  };

  return createStore<PopoverStore<TData, TContext, TPopoverKey>>((rawSet, get) => {
    const getCurrentState = () =>
      isBatching
        ? ({ ...get(), ...batchedStatePatch } as PopoverStore<TData, TContext, TPopoverKey>)
        : get();

    const set = (
      patchOrFn:
        | Partial<PopoverStore<TData, TContext, TPopoverKey>>
        | ((
            state: PopoverStore<TData, TContext, TPopoverKey>,
          ) => Partial<PopoverStore<TData, TContext, TPopoverKey>>),
    ) => {
      const currentState = getCurrentState();
      let patch = typeof patchOrFn === 'function' ? patchOrFn(currentState) : patchOrFn;

      for (const mw of middlewares) {
        const res = mw(patch, currentState);
        if (res === false) return;
        if (res && typeof res === 'object') {
          patch = res;
        }
      }

      const debug = currentState?.debug;
      if (isBatching) {
        batchedStatePatch = { ...batchedStatePatch, ...patch };
        return;
      }
      rawSet((state: PopoverStore<TData, TContext, TPopoverKey>) => {
        if (debug) {
          console.group(`Popover Store Update [${new Date().toLocaleTimeString()}]`);
          console.log('State Patch:', patch);
        }
        const nextState = {
          ...state,
          ...patch,
        };
        if (debug) {
          console.log('Next State:', nextState);
          console.groupEnd();
          const devToolsKey = '__REDUX_DEVTOOLS_EXTENSION__';
          const devTools = (window as unknown as Record<string, unknown>)[devToolsKey] as
            | { send: (name: string, state: unknown) => void }
            | undefined;
          if (devTools) {
            try {
              devTools.send('Popover Store Update', nextState);
            } catch {
              // Ignore devtools errors
            }
          }
        }
        return nextState;
      });
    };

    const resetStoreState = () => {
      for (const controller of activeControllers.values()) {
        controller.abort();
      }
      activeControllers.clear();
      inFlightPromises.clear();

      for (const timer of hoverCloseTimers.values()) {
        clearTimeout(timer);
      }
      hoverCloseTimers.clear();

      for (const timer of transitionTimers.values()) {
        clearTimeout(timer);
      }
      transitionTimers.clear();

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

    const findEntryByKey = (key: string): TrailEntry<TData> | undefined => {
      const { floating, trail } = get();
      const idx = findEntryIndex(floating, trail, key);
      return idx !== -1 ? getEntryAtIndex(floating, trail, idx) : undefined;
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
        | Partial<PopoverStore<TData, TContext, TPopoverKey>>
        | ((
            state: PopoverStore<TData, TContext, TPopoverKey>,
          ) => Partial<PopoverStore<TData, TContext, TPopoverKey>>),
    ): Promise<void> => {
      const { floating, trail } = get();
      const existingIdx = findEntryIndex(floating, trail, key);
      const existingEntry =
        existingIdx !== -1 ? getEntryAtIndex(floating, trail, existingIdx) : undefined;

      const localCollision = options?.collision;
      const { cache: storeCache, context } = get();

      const buildEntry = (
        data?: TData,
        error: Error | null = null,
        isLoading = false,
      ): TrailEntry<TData> => ({
        key,
        parentKey,
        originalParentKey: parentKey ?? existingEntry?.originalParentKey,
        rect: rect ?? existingEntry?.rect,
        originalRect: rect ?? existingEntry?.originalRect,
        data,
        error,
        isLoading,
        collision: localCollision,
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
      });

      const updateEntryStateInLists = (patch: Partial<TrailEntry<TData>>) => {
        set((state) => updateEntryInLists(state.floating, state.trail, key, patch));
      };

      let cachedVal: TData | undefined = undefined;
      if (storeCache) {
        try {
          const rawCached = storeCache.get(key);
          cachedVal = isPromise(rawCached) ? await rawCached : rawCached;
        } catch {
          // Ignore cache errors
        }
      }

      if (cachedVal !== undefined) {
        const entry = buildEntry(cachedVal);
        set(insertStatePatch(entry));
        options?.onOpen?.(entry);
        activeControllers.delete(controllerKey);
        inFlightPromises.delete(key);
        return;
      }

      let resultOrPromise: TData | Promise<TData> | undefined = inFlightPromises.get(key);
      let controller: AbortController;

      if (!resultOrPromise) {
        abortControllersForKeys([controllerKey]);
        controller = new AbortController();
        activeControllers.set(controllerKey, controller);

        try {
          resultOrPromise = get().resolveData(
            key,
            parentData,
            context ?? undefined,
            controller.signal,
          );
          if (isPromise<TData>(resultOrPromise)) {
            inFlightPromises.set(key, resultOrPromise);
          }
        } catch (err) {
          const errorObj = err instanceof Error ? err : new Error(String(err));
          const entry = buildEntry(undefined, errorObj);
          set(insertStatePatch(entry));
          options?.onError?.(errorObj, key);
          activeControllers.delete(controllerKey);
          inFlightPromises.delete(key);
          return;
        }
      } else {
        controller = activeControllers.get(controllerKey) ?? new AbortController();
      }

      if (!isPromise<TData>(resultOrPromise)) {
        const entry = buildEntry(resultOrPromise);
        set(insertStatePatch(entry));
        options?.onOpen?.(entry);
        if (storeCache && resultOrPromise !== undefined) {
          void storeCache.set(key, resultOrPromise);
        }
        activeControllers.delete(controllerKey);
        inFlightPromises.delete(key);
        return;
      }

      const startedCounter = incrementCounter();
      const loadingEntry = buildEntry(undefined, null, true);
      set(insertStatePatch(loadingEntry));

      try {
        const resolved = await resultOrPromise;
        if (controller.signal.aborted || isStale(startedCounter)) return;

        if (storeCache && resolved !== undefined) {
          void storeCache.set(key, resolved);
        }

        updateEntryStateInLists({ isLoading: false, data: resolved, error: null });
        const updatedEntry = findEntryByKey(key);
        if (updatedEntry) {
          options?.onOpen?.(updatedEntry);
        }
      } catch (err) {
        if (controller.signal.aborted || isStale(startedCounter)) return;
        const errorObj = err instanceof Error ? err : new Error(String(err));

        updateEntryStateInLists({ isLoading: false, error: errorObj });
        options?.onError?.(errorObj, key);
      } finally {
        if (activeControllers.get(controllerKey) === controller) {
          activeControllers.delete(controllerKey);
        }
        inFlightPromises.delete(key);
      }
    };

    const actions: PopoverActions<TData, TContext> = {
      setContext: (context) => {
        if (!equal(get().context, context)) {
          set({ context });
        }
      },

      setResolveData: (newResolver) => {
        if (get().resolveData !== newResolver) {
          for (const controller of activeControllers.values()) {
            controller.abort();
          }
          activeControllers.clear();
          inFlightPromises.clear();
          set({ resolveData: newResolver });
        }
      },

      setOwnerId: (ownerId) => {
        if (get().ownerId !== ownerId) {
          set({ ownerId });
        }
      },

      openRoot: (ownerId, entry) => {
        const current = getCurrentState();
        pushSnapshot(current);
        abortControllersForKeys(current.trail.map((e) => e.key));
        emitEvent({ type: 'open_root', key: entry.key, ownerId });
        set((state) => openRootState(state, ownerId, entry));
      },

      pushNested: (index, entry) => {
        const current = getCurrentState();
        pushSnapshot(current);
        const { trail, floating } = current;
        const isFloating = index < floating.length;
        if (!isFloating) {
          const trailIndex = index - floating.length;
          const truncatedKeys = trail.slice(trailIndex + 1).map((e) => e.key);
          abortControllersForKeys(truncatedKeys);
        }
        emitEvent({ type: 'push_nested', key: entry.key, parentKey: entry.parentKey });
        set((state) => pushNestedState(state, index, entry));
      },

      togglePin: (key, rect) => {
        pushSnapshot(getCurrentState());
        clearHoverTimer(key);
        set((state) => togglePinState(state, key, rect));
        const entry = findEntryByKey(key);
        const isPinned = get().floating.some((e) => e.key === key);
        entry?.onPin?.(key, isPinned);
      },

      bringToFront: (key) => {
        set((state) => {
          if (!hasEntryWithKey(state.floating, state.trail, key)) return {};
          const entry =
            state.floating.find((e) => e.key === key) ?? state.trail.find((e) => e.key === key);
          if (entry?.transitionStatus === 'unmounting') return {};
          return bringToFrontPatch(state, key);
        });
      },

      closeFrom: (index, options) => {
        const { floating, trail, closePinnedDescendants } = get();
        const totalCount = floating.length + trail.length;
        if (index < 0 || index >= totalCount) return;

        const isFloating = index < floating.length;
        let directClosedKeys: string[];
        if (isFloating) {
          const entry = floating[index];
          if (!entry) return;
          directClosedKeys = [entry.key];
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

        pushSnapshot(getCurrentState());

        // 1. Abort controllers and clear hover/transition timers immediately
        abortControllersForKeys(removedKeys);

        const { exitTransitionDuration: globalDuration } = get();
        let maxDuration = globalDuration;
        for (const key of removedKeys) {
          const entry = findEntryByKey(key);
          if (entry?.exitTransitionDuration !== undefined) {
            maxDuration = Math.max(maxDuration, entry.exitTransitionDuration);
          }
        }

        if (options?.transition && maxDuration > 0) {
          // 2. Mark entries as unmounting in the state
          set((state) => {
            const update = (e: TrailEntry<TData>) =>
              removedKeys.has(e.key) ? { ...e, transitionStatus: 'unmounting' as const } : e;
            return {
              trail: state.trail.map(update),
              floating: state.floating.map(update),
            };
          });

          // 3. Defer actual array removal to let exit transition finish
          for (const key of removedKeys) {
            clearTransitionTimer(key);
          }
          const exitTimer = setTimeout(() => {
            set((state) => {
              const nextFloating = state.floating.filter(
                (e) => !removedKeys.has(e.key) || e.transitionStatus !== 'unmounting',
              );
              const nextTrail = state.trail.filter(
                (e) => !removedKeys.has(e.key) || e.transitionStatus !== 'unmounting',
              );
              const nextPinnedStates = { ...state.pinnedStates };
              for (const k of removedKeys) {
                const exists =
                  nextFloating.some((e) => e.key === k) || nextTrail.some((e) => e.key === k);
                if (!exists) {
                  nextPinnedStates[k] = false;
                }
              }
              return {
                floating: nextFloating,
                trail: nextTrail,
                ...getCleanupStatePatch<TData, TContext>(
                  nextFloating,
                  nextTrail,
                  state.offsets,
                  state.zIndexOrder,
                  nextPinnedStates,
                  state.nestedHydrationRequestCounters,
                ),
              };
            });
            for (const key of removedKeys) {
              transitionTimers.delete(key);
            }
          }, maxDuration);

          for (const key of removedKeys) {
            transitionTimers.set(key, exitTimer);
          }
        } else {
          // Instant synchronous close
          set((state) => {
            const nextFloating = state.floating.filter((e) => !removedKeys.has(e.key));
            const nextTrail = state.trail.filter((e) => !removedKeys.has(e.key));
            const nextPinnedStates = { ...state.pinnedStates };
            for (const k of removedKeys) {
              nextPinnedStates[k] = false;
            }
            return {
              floating: nextFloating,
              trail: nextTrail,
              ...getCleanupStatePatch<TData, TContext>(
                nextFloating,
                nextTrail,
                state.offsets,
                state.zIndexOrder,
                nextPinnedStates,
                state.nestedHydrationRequestCounters,
              ),
            };
          });
        }
      },

      updateOffset: (key, x, y) => {
        if (Number.isNaN(x) || Number.isNaN(y)) return;
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
        if (!topKey) return;
        const idx = findEntryIndex(floating, trail, topKey);
        if (idx !== -1) {
          set((state) => closeFromState(state, idx));
        }
      },

      // Async/Hydration Actions
      openRootWithResolver: async (keyOrName, anchorEvent, options) => {
        if ('stopPropagation' in anchorEvent && typeof anchorEvent.stopPropagation === 'function') {
          anchorEvent.stopPropagation();
        }
        const { ownerId, trail } = get();
        const finalOwnerId = options?.ownerId ?? ownerId ?? 'default';

        // Check if already open as root of active trail
        if (
          trail.length > 0 &&
          trail[0]?.key === keyOrName &&
          trail[0]?.transitionStatus !== 'unmounting' &&
          get().ownerId === finalOwnerId
        ) {
          return;
        }

        const anchorElement = 'currentTarget' in anchorEvent ? anchorEvent.currentTarget : null;
        const rawRect =
          'currentTarget' in anchorEvent && anchorEvent.currentTarget
            ? anchorEvent.currentTarget.getBoundingClientRect()
            : 'getBoundingClientRect' in anchorEvent
              ? anchorEvent.getBoundingClientRect()
              : new DOMRect(0, 0, 0, 0);

        const sanitizeNum = (n: number) => (Number.isFinite(n) ? n : 0);
        const anchorRect = new DOMRect(
          sanitizeNum(rawRect.x),
          sanitizeNum(rawRect.y),
          sanitizeNum(rawRect.width),
          sanitizeNum(rawRect.height),
        );

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
          if (
            existingEntry &&
            existingEntry.transitionStatus !== 'unmounting' &&
            (existingEntry.parentKey === sourceKey || existingEntry.originalParentKey === sourceKey)
          ) {
            actions.bringToFront(keyOrName);
            return;
          }
        }

        const sourceEntry = getEntryAtIndex(floating, trail, sourceIndex);
        if (!sourceEntry || sourceEntry.transitionStatus === 'unmounting') return;

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

        const effectiveParentKey = entry.parentKey ?? entry.originalParentKey;
        let parentData: TData | undefined = undefined;
        if (effectiveParentKey) {
          const pIndex = findEntryIndex(floating, trail, effectiveParentKey);
          if (pIndex !== -1) {
            parentData = getEntryAtIndex(floating, trail, pIndex)?.data;
          }
        }

        const options = {
          collision: entry.collision,
          hover: entry.hover,
          ariaDescribedby: entry.ariaDescribedby,
          allowDragWhenUnpinned: entry.allowDragWhenUnpinned,
          placement: entry.placement,
          offset: entry.offset,
          exitTransitionDuration: entry.exitTransitionDuration,
          baseZIndex: entry.baseZIndex,
          cascadeOffsetStep: entry.cascadeOffsetStep,
          cascadeOffsetDirection: entry.cascadeOffsetDirection,
          enableTilt: entry.enableTilt,
          maxTiltAngle: entry.maxTiltAngle,
          tiltSensitivity: entry.tiltSensitivity,
          dragAxis: entry.dragAxis,
          tiltFriction: entry.tiltFriction,
          tiltDecay: entry.tiltDecay,
          mountingClassName: entry.mountingClassName,
          unmountingClassName: entry.unmountingClassName,
          mountedClassName: entry.mountedClassName,
        };

        if (effectiveParentKey) {
          await resolvePopoverEntry(
            key,
            effectiveParentKey,
            entry.rect ?? null,
            parentData,
            options,
            key,
            () => incrementNestedCounter(effectiveParentKey),
            (startedCounter) => isNestedStale(effectiveParentKey, startedCounter),
            (updatedEntry) => (state) =>
              updateEntryInLists(state.floating, state.trail, key, updatedEntry),
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
            (updatedEntry) => (state) =>
              updateEntryInLists(state.floating, state.trail, key, updatedEntry),
          );
        }
      },
      destroy: () => {
        resetStoreState();
      },
      setClosePinnedDescendants: (closePinnedDescendants) => {
        if (get().closePinnedDescendants !== closePinnedDescendants) {
          set({ closePinnedDescendants });
        }
      },
      setCollisionConfig: (collisionConfig) => {
        if (!equal(get().collisionConfig, collisionConfig)) {
          set({ collisionConfig });
        }
      },
      closeByKey: (key, options) => {
        const { floating, trail } = get();
        const index = findEntryIndex(floating, trail, key);
        if (index === -1) return;

        const entry = getEntryAtIndex(floating, trail, index);
        if (entry?.transitionStatus === 'unmounting' && options?.transition) return;

        actions.closeFrom(index, options);
      },
      setEnableArrowNavigation: (enableArrowNavigation) => {
        if (get().enableArrowNavigation !== enableArrowNavigation) {
          set({ enableArrowNavigation });
        }
      },
      setDebug: (debug) => {
        if (get().debug !== debug) {
          set({ debug });
        }
      },
      hoverEnter: (key) => {
        let currentKey: string | undefined = key;
        while (currentKey) {
          clearHoverTimer(currentKey);
          const entry = findEntryByKey(currentKey);
          currentKey = entry?.parentKey ?? entry?.originalParentKey;
        }
      },
      hoverLeave: (key, delay = 300) => {
        clearHoverTimer(key);
        const newTimer = setTimeout(() => {
          actions.closeByKey(key, { transition: true });
          hoverCloseTimers.delete(key);
        }, delay);
        hoverCloseTimers.set(key, newTimer);
      },
      setCascadeOffsetStep: (cascadeOffsetStep) => {
        if (get().cascadeOffsetStep !== cascadeOffsetStep) {
          set({ cascadeOffsetStep });
        }
      },
      setTransitionStatus: (key, status) => {
        const entry = findEntryByKey(key);
        if (entry?.transitionStatus === status) return;

        set((state) =>
          updateEntryInLists(state.floating, state.trail, key, { transitionStatus: status }),
        );
      },
      setExitTransitionDuration: (exitTransitionDuration) => {
        if (get().exitTransitionDuration !== exitTransitionDuration) {
          set({ exitTransitionDuration });
        }
      },
      setDefaultOffset: (defaultOffset) => {
        if (get().defaultOffset !== defaultOffset) {
          set({ defaultOffset });
        }
      },
      setBaseZIndex: (baseZIndex) => {
        if (get().baseZIndex !== baseZIndex) {
          set({ baseZIndex });
        }
      },
      setGlobalAnimationClassNames: (mounting, unmounting, mounted) => {
        if (
          get().mountingClassName !== mounting ||
          get().unmountingClassName !== unmounting ||
          get().mountedClassName !== mounted
        ) {
          set({
            mountingClassName: mounting,
            unmountingClassName: unmounting,
            mountedClassName: mounted,
          });
        }
      },
      subscribeEvent: (listener) => {
        eventListeners.add(listener);
        return () => {
          eventListeners.delete(listener);
        };
      },
      batchUpdates: (fn) => {
        if (isBatching) {
          fn(actions);
          return;
        }
        isBatching = true;
        batchedStatePatch = {};
        try {
          fn(actions);
        } finally {
          isBatching = false;
          if (Object.keys(batchedStatePatch).length > 0) {
            const finalPatch = batchedStatePatch;
            batchedStatePatch = {};
            set(finalPatch);
          }
        }
      },
      useMiddleware: (middleware) => {
        middlewares.add(middleware);
        return () => {
          middlewares.delete(middleware);
        };
      },
      canUndo: () => undoStack.length > 0,
      canRedo: () => redoStack.length > 0,
      undo: () => {
        if (undoStack.length === 0) return;
        const current = get();
        const prev = undoStack.pop()!;
        redoStack.push({
          trail: current.trail,
          floating: current.floating,
          offsets: current.offsets,
          pinnedStates: current.pinnedStates,
          zIndexOrder: current.zIndexOrder,
          ownerId: current.ownerId,
        });
        set({
          trail: prev.trail,
          floating: prev.floating,
          offsets: prev.offsets,
          pinnedStates: prev.pinnedStates,
          zIndexOrder: prev.zIndexOrder,
          ownerId: prev.ownerId,
        });
      },
      redo: () => {
        if (redoStack.length === 0) return;
        const current = get();
        const next = redoStack.pop()!;
        undoStack.push({
          trail: current.trail,
          floating: current.floating,
          offsets: current.offsets,
          pinnedStates: current.pinnedStates,
          zIndexOrder: current.zIndexOrder,
          ownerId: current.ownerId,
        });
        set({
          trail: next.trail,
          floating: next.floating,
          offsets: next.offsets,
          pinnedStates: next.pinnedStates,
          zIndexOrder: next.zIndexOrder,
          ownerId: next.ownerId,
        });
      },
      transaction: async (fn) => {
        const snapshotState = getCurrentState();
        const snapshotControllers = new Set(activeControllers.keys());
        try {
          await fn(actions);
          return true;
        } catch (err) {
          if (getCurrentState().debug) {
            console.error('Popover Transaction Rollback:', err);
          }
          for (const key of activeControllers.keys()) {
            if (!snapshotControllers.has(key)) {
              const controller = activeControllers.get(key);
              if (controller) controller.abort();
              activeControllers.delete(key);
            }
          }
          set({
            trail: snapshotState.trail,
            floating: snapshotState.floating,
            offsets: snapshotState.offsets,
            pinnedStates: snapshotState.pinnedStates,
            zIndexOrder: snapshotState.zIndexOrder,
            ownerId: snapshotState.ownerId,
            anchorElement: snapshotState.anchorElement,
            anchorRect: snapshotState.anchorRect,
          });
          return false;
        }
      },
      persistState: async (config) => {
        const storageKey = config?.key ?? 'popover_store_state';
        const engine =
          config?.storage ??
          (typeof window !== 'undefined' && window.localStorage ? window.localStorage : null);
        if (!engine) return;

        const { floating, pinnedStates, offsets, zIndexOrder } = getCurrentState();
        const filterFn = config?.filter;

        const filteredFloating = filterFn ? floating.filter((e) => filterFn(e.key)) : floating;
        const keysToSave = new Set(filteredFloating.map((e) => e.key));

        const savedOffsets: Record<string, { x: number; y: number }> = {};
        const savedPinnedStates: Record<string, boolean> = {};

        for (const k of keysToSave) {
          if (offsets[k]) savedOffsets[k] = offsets[k]!;
          if (pinnedStates[k] !== undefined) savedPinnedStates[k] = pinnedStates[k]!;
        }

        const payload = JSON.stringify({
          floating: filteredFloating,
          offsets: savedOffsets,
          pinnedStates: savedPinnedStates,
          zIndexOrder: zIndexOrder.filter((k) => keysToSave.has(k)),
        });

        await engine.setItem(storageKey, payload);
      },

      rehydrateState: async (config) => {
        const storageKey = config?.key ?? 'popover_store_state';
        const engine =
          config?.storage ??
          (typeof window !== 'undefined' && window.localStorage ? window.localStorage : null);
        if (!engine) return false;

        try {
          const raw = await engine.getItem(storageKey);
          if (!raw) return false;
          const parsed = JSON.parse(raw);
          if (!parsed || !Array.isArray(parsed.floating)) return false;

          const current = getCurrentState();
          set({
            floating: parsed.floating,
            offsets: { ...current.offsets, ...parsed.offsets },
            pinnedStates: { ...current.pinnedStates, ...parsed.pinnedStates },
            zIndexOrder: Array.from(
              new Set([...current.zIndexOrder, ...(parsed.zIndexOrder ?? [])]),
            ),
          });
          return true;
        } catch {
          return false;
        }
      },
      setButtonControls: (key, controls) => {
        set((state) =>
          updateEntryInLists(state.floating, state.trail, key, { buttonControls: controls }),
        );
      },
      toggleButtonControl: (key, control, enabled) => {
        const entry = findEntryByKey(key);
        if (!entry) return;

        const currentControls = entry.buttonControls ?? {};
        const nextValue = enabled ?? !(currentControls[control] ?? true);

        set((state) =>
          updateEntryInLists(state.floating, state.trail, key, {
            buttonControls: {
              ...currentControls,
              [control]: nextValue,
            },
          }),
        );
      },
      setStackGroupFilter: (group) => {
        set({ activeStackGroup: group });
      },
      setResponsiveMode: (mode) => {
        set({ responsiveMode: mode });
      },
      setZIndexBaseMap: (map) => {
        set({ zIndexBaseMap: map });
      },
      setSlotComponents: (components) => {
        set({ components });
      },
      prefetchPopover: async (key, parentData) => {
        const storeCache = get().cache;
        if (!storeCache) return undefined;

        try {
          const rawCached = storeCache.get(key);
          const cachedVal = isPromise(rawCached) ? await rawCached : rawCached;
          if (cachedVal !== undefined) return cachedVal as TData;

          const controller = new AbortController();
          const result = await get().resolveData(
            key,
            parentData,
            get().context ?? undefined,
            controller.signal,
          );
          if (result !== undefined) {
            void storeCache.set(key, result);
          }
          return result;
        } catch {
          return undefined;
        }
      },
    };

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
      exitTransitionDuration: 0,
      defaultOffset: 8,
      baseZIndex: 1000,
      mountingClassName: 'mounting',
      unmountingClassName: 'unmounting',
      mountedClassName: 'mounted',
      activeStackGroup: null,
      responsiveMode: 'auto' as const,
      mobileBreakpoint: 640,
      components: null,
      zIndexBaseMap: null,

      ...actions,
      actions,
    };
  });
}
