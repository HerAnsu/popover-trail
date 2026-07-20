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
  const hoverCloseTimers = new Map<string, ReturnType<typeof setTimeout>>();

  const clearHoverTimer = (key: string) => {
    const timer = hoverCloseTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      hoverCloseTimers.delete(key);
    }
  };

  const abortControllersForKeys = (keys: Iterable<string>) => {
    for (const key of keys) {
      const controller = activeControllers.get(key);
      if (controller) {
        controller.abort();
        activeControllers.delete(key);
      }
      clearHoverTimer(key);
    }
  };

  return createStore<PopoverStore<TData, TContext, TPopoverKey>>((rawSet, get) => {
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
        placement: options?.placement,
        transitionStatus: 'mounting',
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
      });

      const updateEntryStateInLists = (patch: Partial<TrailEntry<TData>>) => {
        set((state) => updateEntryInLists(state.floating, state.trail, key, patch));
      };

      const cached = storeCache?.get(key);
      if (cached !== undefined && !isPromise<TData>(cached)) {
        set(insertStatePatch(buildEntry(cached as TData)));
        activeControllers.delete(controllerKey);
        return;
      }

      let resultOrPromise: Promise<TData> | TData | undefined;
      try {
        resultOrPromise =
          cached !== undefined
            ? cached
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

      setResolveData: (newResolver) => {
        set({ resolveData: newResolver });
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

      closeFrom: (index, options) => {
        const { floating, trail, closePinnedDescendants } = get();
        const totalCount = floating.length + trail.length;
        if (index >= 0 && index < totalCount) {
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

          // 1. Abort controllers and clear hover timers immediately
          abortControllersForKeys(removedKeys);

          const { exitTransitionDuration: globalDuration } = get();
          let maxDuration = globalDuration;
          const durationLookup = new Map<string, number | undefined>();
          for (const e of floating) durationLookup.set(e.key, e.exitTransitionDuration);
          for (const e of trail) durationLookup.set(e.key, e.exitTransitionDuration);
          for (const key of removedKeys) {
            const duration = durationLookup.get(key);
            if (duration !== undefined) {
              maxDuration = Math.max(maxDuration, duration);
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
            setTimeout(() => {
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
            }, maxDuration); // exit transition window
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
        }
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
        if (trail.length > 0 && trail[0]?.key === keyOrName && get().ownerId === finalOwnerId) {
          return;
        }

        const anchorElement = 'currentTarget' in anchorEvent ? anchorEvent.currentTarget : null;
        const rawRect =
          'currentTarget' in anchorEvent && anchorEvent.currentTarget
            ? anchorEvent.currentTarget.getBoundingClientRect()
            : 'getBoundingClientRect' in anchorEvent
              ? anchorEvent.getBoundingClientRect()
              : new DOMRect(0, 0, 0, 0);
        const anchorRect = new DOMRect(rawRect.x, rawRect.y, rawRect.width, rawRect.height);

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
        if (index !== -1) {
          actions.closeFrom(index, options);
        }
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
        clearHoverTimer(key);
        const { trail, floating } = get();
        // Build a fast lookup Map for parent keys to make climbing tree O(1) per step
        const parentMap = new Map<string, string | undefined>();
        floating.forEach((e) => parentMap.set(e.key, e.parentKey));
        trail.forEach((e) => parentMap.set(e.key, e.parentKey));

        let currentKey: string | undefined = key;
        while (currentKey) {
          const parentKey = parentMap.get(currentKey);
          if (parentKey) {
            clearHoverTimer(parentKey);
            currentKey = parentKey;
          } else {
            break;
          }
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
    };

    // Clean destructuring of remaining public actions without unsafe casts or mutating delete
    const {
      setContext: _setContext,
      setResolveData: _setResolveData,
      setOwnerId: _setOwnerId,
      openRoot: _openRoot,
      pushNested: _pushNested,
      destroy: _destroy,
      setClosePinnedDescendants: _setClosePinnedDescendants,
      setCollisionConfig: _setCollisionConfig,
      setEnableArrowNavigation: _setEnableArrowNavigation,
      setDebug: _setDebug,
      setCascadeOffsetStep: _setCascadeOffsetStep,
      setExitTransitionDuration: _setExitTransitionDuration,
      setDefaultOffset: _setDefaultOffset,
      setBaseZIndex: _setBaseZIndex,
      setGlobalAnimationClassNames: _setGlobalAnimationClassNames,
      ...publicActions
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

      ...actions,
      actions: publicActions,
    };
  });
}
