/**
 * Zustand Store Composition Root Engine for popover-trail.
 * Coordinates trail linkages, floating/pinned states, drag offsets, stacking order, and lifecycle transitions.
 *
 * @module store
 */

import { createStore } from 'zustand/vanilla';
import { PopoverMiddlewareEngine } from './store/storeMiddlewareEngine';
import type {
  PopoverStore,
  PopoverResolver,
  TrailEntry,
  PopoverCache,
  PopoverStoreEvent,
  OpenRootOptions,
  OpenNestedOptions,
} from './types';
import { findEntryInStore } from './utils/storeHelpers';
import { createHistoryManager } from './store/history';
import { createTimerManager } from './store/timers';
import { createHydrationManager } from './store/storeHydration';
import { createControllerManager } from './store/storeControllers';
import { createStoreActions } from './store/storeActionRegistry';
import { PopoverDAG } from './utils/dag';
import { getInitialStoreState, EMPTY_ARRAY, EMPTY_OBJECT } from './store/storeDefaults';
import { createBatchingManager } from './store/storeBatching';
import { resolvePopoverEntry } from './store/storeResolverPipeline';

/**
 * Instantiates and returns a generic Zustand vanilla StoreApi instance.
 * Coordinates trail linkages, floating/pinned states, drag offsets, stacking order,
 * active loaders, and abort controllers.
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
  const controllerManager = createControllerManager<TData>();
  const hydrationManager = createHydrationManager();
  const popoverDAG = new PopoverDAG();
  const batchingManager = createBatchingManager();

  const {
    activeControllers,
    inFlightPromises,
    registerController,
    removeController,
    abortControllersForKeys,
  } = controllerManager;

  const {
    incrementRootCounter,
    isRootStale,
    incrementNestedCounter,
    isNestedStale,
    resetHydrationCounters,
  } = hydrationManager;

  const timerManager = createTimerManager();
  const {
    hoverCloseTimers,
    transitionTimers,
    clearHoverTimer,
    clearTransitionTimer,
    clearAllTimers,
  } = timerManager;

  const historyManager = createHistoryManager<TData>(30);
  const { undoStack, redoStack, pushSnapshot, clearHistory } = historyManager;

  const eventListeners = new Set<(event: PopoverStoreEvent<TData>) => void>();
  const middlewareEngine = new PopoverMiddlewareEngine<TData, TContext, TPopoverKey>();

  const store = createStore<PopoverStore<TData, TContext, TPopoverKey>>((set, get) => {
    // Middleware-intercepted setState wrapper
    const safeSet = (
      partial:
        | Partial<PopoverStore<TData, TContext, TPopoverKey>>
        | ((
            state: PopoverStore<TData, TContext, TPopoverKey>,
          ) => Partial<PopoverStore<TData, TContext, TPopoverKey>>),
    ) => {
      set((state) => {
        const patch = typeof partial === 'function' ? partial(state) : partial;
        const nextPatch = middlewareEngine.apply(patch, state);
        if (nextPatch === false) return {};
        return nextPatch;
      });
    };

    const resetStoreState = () => {
      activeControllers.forEach((c) => c.abort());
      activeControllers.clear();

      inFlightPromises.clear();
      clearAllTimers();
      popoverDAG.clear();
      clearHistory();
      resetHydrationCounters();

      safeSet({
        ownerId: null,
        trail: EMPTY_ARRAY as unknown as readonly [],
        floating: EMPTY_ARRAY as unknown as readonly [],
        offsets: EMPTY_OBJECT as Record<string, { x: number; y: number }>,
        pinnedStates: EMPTY_OBJECT as Record<string, boolean>,
        zIndexOrder: EMPTY_ARRAY as unknown as readonly [],
        rootHydrationRequestCounter: 0,
        nestedHydrationRequestCounters: EMPTY_OBJECT as Record<string, number>,
        anchorElement: null,
        anchorRect: null,
      });
    };

    const findEntryByKey = (key: string): TrailEntry<TData> | undefined => {
      const { floating, trail } = get();
      return findEntryInStore(floating, trail, key);
    };

    const boundResolvePopoverEntry = (
      key: string,
      parentKey: string | undefined,
      rect: DOMRect | null,
      parentData: TData | null | undefined,
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
    ) =>
      resolvePopoverEntry(
        get,
        key,
        parentKey,
        rect,
        parentData,
        options,
        controllerKey,
        incrementCounter,
        isStale,
        insertStatePatch,
        {
          popoverDAG,
          cache,
          resolveData,
          initialContext,
          inFlightPromises,
          registerController,
          removeController,
          safeSet,
          findEntryByKey,
        },
      );

    const actions = Object.freeze(
      createStoreActions<TData, TContext, TPopoverKey>(safeSet, get, {
        activeControllers,
        inFlightPromises,
        hoverCloseTimers,
        transitionTimers,
        eventListeners,
        clearHoverTimer,
        clearTransitionTimer,
        scheduleHoverLeave: timerManager.scheduleHoverLeave,
        scheduleTransitionExit: timerManager.scheduleTransitionExit,
        abortControllersForKeys,
        resetStoreState,
        incrementRootCounter,
        isRootStale,
        incrementNestedCounter,
        isNestedStale,
        findEntryByKey,
        resolvePopoverEntry: boundResolvePopoverEntry,
        pushSnapshot,
        clearHistory,
        undoStack,
        redoStack,
        historyManager,
        startBatch: batchingManager.startBatch,
        endBatch: () => batchingManager.endBatch(get),
        middlewareEngine,
        cache,
      }),
    );

    const initialState = getInitialStoreState<TData, TContext>(resolveData, initialContext, cache);

    return {
      ...initialState,
      ...actions,
      get actions() {
        return actions;
      },
    };
  });

  batchingManager.attachSubscriber<TData, TContext, TPopoverKey>(store);

  return store;
}
