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
import { resolvePopoverEntry, type ResolvePopoverEntryParams } from './store/storeResolverPipeline';
import { SimplePopoverCache } from './utils/cache';

const DISPOSE_SYMBOL: symbol =
  (Symbol as { dispose?: symbol }).dispose ?? Symbol.for('Symbol.dispose');

/**
 * Creates an isolated popover store managing cascading trails, pinned floating windows, and data resolution.
 *
 * @remarks
 * The store manages the full lifecycle of popover cards:
 *
 * 1. **Root Opening**: Clicking an anchor opens the initial card (`trail[0]`) and fetches its data via the resolver.
 * 2. **Cascading Drilldown**: Clicking triggers inside open cards appends nested cards to the `trail` stack.
 * 3. **Pinning & Floating**: Toggling pin detaches a card from the cascade into a standalone `floating` window with draggable coordinates.
 * 4. **Dismissal & Undo**: Cards close on outside clicks, Escape key, or close buttons. History allows reverting changes with `undo()` and `redo()`.
 *
 * @example
 * ```TypeScript
 * import { createPopoverStore } from 'popover-trail';
 *
 * const store = createPopoverStore(async (key) => {
 *   const res = await fetch(`/api/cards/${key}`);
 *   return res.json();
 * });
 *
 * // Open root card
 * await store.getState().openRootWithResolver('userProfile');
 *
 * // Pin as floating window
 * store.getState().togglePin('userProfile');
 * ```
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover string keys.
 * @param resolveData - Asynchronous or synchronous data loader function.
 * @param initialContext - Optional shared context passed to resolvers.
 * @param cache - Optional cache provider instance for memoization (defaults to SimplePopoverCache).
 * @returns Zustand vanilla StoreApi instance.
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
  // Built-in cache fallback so prefetchPopover and resolution caching work out of the box
  const effectiveCache: PopoverCache<TData> = cache ?? new SimplePopoverCache<TData>();

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
        if (
          nextPatch === false ||
          (typeof nextPatch === 'object' &&
            nextPatch !== null &&
            Object.keys(nextPatch).length === 0)
        ) {
          return {};
        }
        return {
          ...nextPatch,
          stateRevision: (state.stateRevision || 0) + 1,
        };
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
        trail: EMPTY_ARRAY,
        floating: EMPTY_ARRAY,
        offsets: EMPTY_OBJECT,
        pinnedStates: EMPTY_OBJECT,
        zIndexOrder: EMPTY_ARRAY,
        rootHydrationRequestCounter: 0,
        nestedHydrationRequestCounters: EMPTY_OBJECT,
        anchorElement: null,
        anchorRect: null,
      });
    };

    const findEntryByKey = (key: string): TrailEntry<TData> | undefined => {
      const { floating, trail } = get();
      return findEntryInStore(floating, trail, key);
    };

    const resolverPipelineDeps = {
      popoverDAG,
      cache: effectiveCache,
      resolveData,
      initialContext,
      inFlightPromises,
      registerController,
      removeController,
      safeSet,
      findEntryByKey,
      eventListeners,
    };

    const boundResolvePopoverEntry = (
      params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
    ) => resolvePopoverEntry(get, params, resolverPipelineDeps);

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
        cache: effectiveCache,
        popoverDAG,
      }),
    );

    const initialState = getInitialStoreState<TData, TContext>(
      resolveData,
      initialContext,
      effectiveCache,
    );

    return {
      ...initialState,
      ...actions,
      get actions() {
        return actions;
      },
    };
  });

  batchingManager.attachSubscriber<TData, TContext, TPopoverKey>(store);

  // Attach explicit resource disposal handle
  const dispose = () => {
    store.getState().destroy();
    controllerManager.dispose();
    timerManager.dispose();
    popoverDAG.clear();
    middlewareEngine.dispose();
  };

  Object.assign(store, {
    dispose,
    [DISPOSE_SYMBOL]: dispose,
  });

  return store;
}
