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
  toError,
  findEntryInStore,
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
  sanitizeRect,
  createTrailEntry,
  getRemovedKeysForClose,
  getSnapshotStatePatch,
} from './utils/storeHelpers';
import { createHistoryManager } from './store/history';
import { createTimerManager } from './store/timers';

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

  const {
    hoverCloseTimers,
    transitionTimers,
    clearHoverTimer,
    clearTransitionTimer,
    clearAllTimers,
  } = createTimerManager();

  const { undoStack, redoStack, pushSnapshot, clearHistory } = createHistoryManager<TData>(30);

  const eventListeners = new Set<(event: import('./types').PopoverStoreEvent<TData>) => void>();
  const middlewares = new Set<import('./types').PopoverMiddleware<TData, TContext, TPopoverKey>>();
  let isBatching = false;
  let batchedStatePatch: Partial<PopoverStore<TData, TContext, TPopoverKey>> = {};

  const emitEvent = (event: import('./types').PopoverStoreEvent<TData>) => {
    if (eventListeners.size === 0) return;
    for (const listener of eventListeners) {
      try {
        listener(event);
      } catch (err) {
        // Prevent event listener errors from disrupting store operations
        console.error('[PopoverStore] Event listener error:', err);
      }
    }
  };

  const safeInvoke = <Args extends unknown[]>(
    fn: ((...args: Args) => void) | undefined,
    ...args: Args
  ) => {
    if (!fn) return;
    try {
      fn(...args);
    } catch (err) {
      console.error('[PopoverStore] Callback error:', err);
    }
  };

  const abortControllersForKeys = (keys: Iterable<string>) => {
    if (Array.isArray(keys) && keys.length === 0) return;
    if (keys instanceof Set && keys.size === 0) return;
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
      if (typeof patch === 'object' && patch !== null && Object.keys(patch).length === 0) return;

      if (middlewares.size > 0) {
        for (const mw of middlewares) {
          const res = mw(patch, currentState);
          if (res === false) return;
          if (res && typeof res === 'object') {
            patch = res;
          }
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
      if (activeControllers.size > 0) {
        for (const controller of activeControllers.values()) {
          controller.abort();
        }
        activeControllers.clear();
      }
      inFlightPromises.clear();

      clearAllTimers();
      clearHistory();

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
      return findEntryInStore(floating, trail, key);
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
      const { floating, trail, cache: storeCache, context } = get();
      const existingEntry = findEntryInStore(floating, trail, key);

      const buildEntry = (
        data?: TData,
        error: Error | null = null,
        isLoading = false,
      ): TrailEntry<TData> =>
        createTrailEntry(key, parentKey, rect, options, existingEntry, data, error, isLoading);

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
          const errorObj = toError(err);
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
        safeInvoke(options?.onOpen, entry);
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
          safeInvoke(options?.onOpen, updatedEntry);
        }
      } catch (err) {
        if (controller.signal.aborted || isStale(startedCounter)) return;
        const errorObj = toError(err);

        updateEntryStateInLists({ isLoading: false, error: errorObj });
        safeInvoke(options?.onError, errorObj, key);
      } finally {
        if (activeControllers.get(controllerKey) === controller) {
          activeControllers.delete(controllerKey);
        }
        inFlightPromises.delete(key);
      }
    };

    const actions: PopoverActions<TData, TContext> = {
      setContext: (context) => {
        const current = get().context;
        if (current === context) return;
        if (!equal(current, context)) {
          set({ context });
        }
      },

      setResolveData: (newResolver) => {
        if (get().resolveData !== newResolver) {
          if (activeControllers.size > 0) {
            for (const controller of activeControllers.values()) {
              controller.abort();
            }
            activeControllers.clear();
          }
          if (inFlightPromises.size > 0) {
            inFlightPromises.clear();
          }
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
        if (current.trail.length > 0) {
          abortControllersForKeys(current.trail.map((e) => e.key));
        }
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
          if (trailIndex + 1 < trail.length) {
            const truncatedKeys = trail.slice(trailIndex + 1).map((e) => e.key);
            abortControllersForKeys(truncatedKeys);
          }
        }
        emitEvent({ type: 'push_nested', key: entry.key, parentKey: entry.parentKey });
        set((state) => pushNestedState(state, index, entry));
      },

      togglePin: (key, rect) => {
        pushSnapshot(getCurrentState());
        clearHoverTimer(key);
        set((state) => togglePinState(state, key, rect));
        const entry = findEntryByKey(key);
        const isPinned = Boolean(get().pinnedStates[key]);
        entry?.onPin?.(key, isPinned);
      },

      bringToFront: (key) => {
        set((state) => {
          if (!hasEntryWithKey(state.floating, state.trail, key)) return {};
          if (state.zIndexOrder[state.zIndexOrder.length - 1] === key) return {};
          const entry =
            state.floating.find((e) => e.key === key) ?? state.trail.find((e) => e.key === key);
          if (entry?.transitionStatus === 'unmounting') return {};
          return bringToFrontPatch(state, key);
        });
      },

      closeFrom: (index, options) => {
        const { floating, trail, closePinnedDescendants } = get();
        const res = getRemovedKeysForClose(floating, trail, index, closePinnedDescendants);
        if (!res) return;
        const { removedKeys } = res;

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
            for (const key of removedKeys) {
              transitionTimers.delete(key);
            }
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

      closeAll: () => {
        resetStoreState();
      },

      clearTrail: () => {
        const { trail } = get();
        if (trail.length === 0) return;

        // Abort the root hydration request and any trail-related nested requests
        const rootController = activeControllers.get('__root__');
        if (rootController) {
          rootController.abort();
          activeControllers.delete('__root__');
        }
        const {
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
        const entry = findEntryInStore(floating, trail, topKey);
        if (entry?.transitionStatus === 'unmounting') return;
        const idx = findEntryIndex(floating, trail, topKey);
        if (idx !== -1) {
          set((state) => closeFromState(state, idx));
        }
      },

      openRootWithResolver: async (keyOrName, anchorEvent, options) => {
        if (
          anchorEvent &&
          'stopPropagation' in anchorEvent &&
          typeof anchorEvent.stopPropagation === 'function'
        ) {
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

        const anchorElement =
          anchorEvent && 'currentTarget' in anchorEvent ? anchorEvent.currentTarget : null;
        const rawRect =
          anchorEvent && 'currentTarget' in anchorEvent && anchorEvent.currentTarget
            ? anchorEvent.currentTarget.getBoundingClientRect()
            : anchorEvent && 'getBoundingClientRect' in anchorEvent
              ? anchorEvent.getBoundingClientRect()
              : new DOMRect(0, 0, 0, 0);

        const anchorRect = sanitizeRect(rawRect);

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
        const existingEntry = findEntryInStore(floating, trail, keyOrName);
        if (existingEntry) {
          if (
            existingEntry &&
            existingEntry.transitionStatus !== 'unmounting' &&
            (existingEntry.parentKey === sourceKey || existingEntry.originalParentKey === sourceKey)
          ) {
            actions.bringToFront(keyOrName);
            return;
          }
        }

        const sourceEntry = findEntryInStore(floating, trail, sourceKey);
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
        const entry = findEntryInStore(floating, trail, key);
        if (!entry || entry.isLoading) return;

        const index = findEntryIndex(floating, trail, key);
        if (index === -1) return;

        const effectiveParentKey = entry.parentKey ?? entry.originalParentKey;
        const parentData = effectiveParentKey
          ? findEntryInStore(floating, trail, effectiveParentKey)?.data
          : undefined;

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
        undoStack.length = 0;
        redoStack.length = 0;
        eventListeners.clear();
        middlewares.clear();
      },
      setClosePinnedDescendants: (closePinnedDescendants) => {
        if (get().closePinnedDescendants !== closePinnedDescendants) {
          set({ closePinnedDescendants });
        }
      },
      setCollisionConfig: (collisionConfig) => {
        const current = get().collisionConfig;
        if (current === collisionConfig) return;
        if (!equal(current, collisionConfig)) {
          set({ collisionConfig });
        }
      },
      closeByKey: (key, options) => {
        const { floating, trail } = get();
        const entry = findEntryInStore(floating, trail, key);
        if (!entry) return;
        if (entry.transitionStatus === 'unmounting' && options?.transition) return;

        const index = findEntryIndex(floating, trail, key);
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
        const visited = new Set<string>();
        while (currentKey && !visited.has(currentKey)) {
          visited.add(currentKey);
          clearHoverTimer(currentKey);
          const entry = findEntryByKey(currentKey);
          currentKey = entry?.parentKey ?? entry?.originalParentKey;
        }
      },
      hoverLeave: (key, delay = 300) => {
        if (get().pinnedStates[key]) return;
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
        if (!entry || entry.transitionStatus === status) return;

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
        } catch (err) {
          batchedStatePatch = {};
          throw err;
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
        if (redoStack.length >= 30) {
          redoStack.shift();
        }
        redoStack.push({
          trail: current.trail,
          floating: current.floating,
          offsets: current.offsets,
          pinnedStates: current.pinnedStates,
          zIndexOrder: current.zIndexOrder,
          ownerId: current.ownerId,
        });
        set(getSnapshotStatePatch(prev));
      },
      redo: () => {
        if (redoStack.length === 0) return;
        const current = get();
        const next = redoStack.pop()!;
        if (undoStack.length >= 30) {
          undoStack.shift();
        }
        undoStack.push({
          trail: current.trail,
          floating: current.floating,
          offsets: current.offsets,
          pinnedStates: current.pinnedStates,
          zIndexOrder: current.zIndexOrder,
          ownerId: current.ownerId,
        });
        set(getSnapshotStatePatch(next));
      },
      transaction: async (fn) => {
        const snapshotState = getCurrentState();
        const snapshotControllers =
          activeControllers.size > 0 ? new Set(activeControllers.keys()) : null;
        try {
          await fn(actions);
          return true;
        } catch (err) {
          if (getCurrentState().debug) {
            console.error('Popover Transaction Rollback:', err);
          }
          if (activeControllers.size > 0) {
            for (const key of activeControllers.keys()) {
              if (!snapshotControllers || !snapshotControllers.has(key)) {
                const controller = activeControllers.get(key);
                if (controller) controller.abort();
                activeControllers.delete(key);
              }
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
        if (filteredFloating.length === 0) {
          await engine.setItem(
            storageKey,
            JSON.stringify({ floating: [], offsets: {}, pinnedStates: {}, zIndexOrder: [] }),
          );
          return;
        }
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
          if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.floating))
            return false;

          const current = getCurrentState();
          const parsedOffsets = parsed.offsets;
          const parsedPinned = parsed.pinnedStates;
          const hasOffsets =
            parsedOffsets &&
            typeof parsedOffsets === 'object' &&
            Object.keys(parsedOffsets).length > 0;
          const hasPinned =
            parsedPinned &&
            typeof parsedPinned === 'object' &&
            Object.keys(parsedPinned).length > 0;
          const parsedZIndex = parsed.zIndexOrder;
          const hasZIndex = Array.isArray(parsedZIndex) && parsedZIndex.length > 0;
          set({
            floating: parsed.floating,
            offsets: hasOffsets ? { ...current.offsets, ...parsedOffsets } : current.offsets,
            pinnedStates: hasPinned
              ? { ...current.pinnedStates, ...parsedPinned }
              : current.pinnedStates,
            zIndexOrder: hasZIndex
              ? Array.from(new Set([...current.zIndexOrder, ...parsedZIndex]))
              : current.zIndexOrder,
          });
          return true;
        } catch {
          return false;
        }
      },
      setButtonControls: (key, controls) => {
        const entry = findEntryByKey(key);
        if (!entry || equal(entry.buttonControls, controls)) return;
        set((state) =>
          updateEntryInLists(state.floating, state.trail, key, { buttonControls: controls }),
        );
      },
      toggleButtonControl: (key, control, enabled) => {
        const entry = findEntryByKey(key);
        if (!entry) return;

        const currentControls = entry.buttonControls ?? {};
        const currentValue = currentControls[control] ?? true;
        const nextValue = enabled ?? !currentValue;

        if (currentValue === nextValue && entry.buttonControls !== undefined) return;

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
        if (get().activeStackGroup !== group) {
          set({ activeStackGroup: group });
        }
      },
      setResponsiveMode: (mode) => {
        if (get().responsiveMode !== mode) {
          set({ responsiveMode: mode });
        }
      },
      setZIndexBaseMap: (map) => {
        if (get().zIndexBaseMap !== map) {
          set({ zIndexBaseMap: map });
        }
      },
      setSlotComponents: (components) => {
        if (get().components !== components) {
          set({ components });
        }
      },
      prefetchPopover: async (key, parentData) => {
        const storeCache = get().cache;
        if (!storeCache) return undefined;

        try {
          const rawCached = storeCache.get(key);
          const cachedVal = isPromise(rawCached) ? await rawCached : rawCached;
          if (cachedVal !== undefined) return cachedVal as TData;

          const existingPromise = inFlightPromises.get(key);
          if (existingPromise) {
            return await existingPromise;
          }

          const controller = new AbortController();
          const promise = get().resolveData(
            key,
            parentData,
            get().context ?? undefined,
            controller.signal,
          );
          if (isPromise<TData>(promise)) {
            inFlightPromises.set(key, promise);
          }
          const result = await promise;
          inFlightPromises.delete(key);
          if (result !== undefined) {
            void storeCache.set(key, result);
          }
          return result;
        } catch {
          inFlightPromises.delete(key);
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
