/**
 * Zustand Store Composition Root Engine for popover-trail.
 * Coordinates trail linkages, floating/pinned states, drag offsets, stacking order, and lifecycle transitions.
 *
 * @module store
 */

import { createStore, type StoreApi } from 'zustand/vanilla';
import { PopoverMiddlewareEngine } from './store/storeMiddlewareEngine';
import type {
  PopoverStore,
  PopoverResolver,
  TrailEntry,
  PopoverCache,
  PopoverStoreEvent,
  StatePatch,
  StoreSliceDescriptor,
  InferSliceActionsFromTuple,
  InferSliceStateFromTuple,
  PopoverStateData,
  DragOffset,
} from './types';
import { findEntryInStore } from './utils/storeHelpers';
import { createHistoryManager } from './store/history';
import { createHydrationManager } from './store/storeHydration';
import { createControllerManager } from './store/storeControllers';
import { createStoreActions, type ActionRegistryDependencies } from './store/storeActionRegistry';
import { PopoverDAG } from './utils/dag';
import { getInitialStoreState, EMPTY_ARRAY, EMPTY_OBJECT } from './store/storeDefaults';
import { createBatchingManager } from './store/storeBatching';
import { resolvePopoverEntry, type ResolvePopoverEntryParams } from './store/storeResolverPipeline';
import { SimplePopoverCache } from './utils/cache';
import { PopoverTransitionScheduler } from './store/transitionScheduler';
import { PopoverEventBus } from './store/eventBus';
import { wrapResult, isErr } from './utils/result';
import type { SliceContext } from './store/slices/sliceContext';
import { DISPOSE_SYMBOL } from './utils/disposable';

/**
 * Own-enumerable emptiness check without allocating a keys array.
 * Semantically identical to `Object.keys(value).length === 0`.
 */
function isEmptyOwnObject(value: object): boolean {
  for (const key in value) {
    if (Object.hasOwn(value, key)) return false;
  }
  return true;
}

/**
 * Options container for configuring createPopoverStore with custom slices and infrastructure dependencies.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover string keys.
 * @template TSlices - Tuple of custom StoreSliceDescriptor instances.
 */
export interface PopoverStoreOptions<
  TData = unknown,
  TContext = unknown,
  _TPopoverKey extends string = string,
  TSlices extends readonly unknown[] = readonly unknown[],
> {
  readonly cache?: PopoverCache<TData>;
  readonly initialContext?: TContext;
  readonly customSlices?: TSlices;
}

/**
 * Zustand Store Composition Root Engine for popover-trail (Open/Closed Principle).
 * Coordinates trail linkages, floating/pinned states, drag offsets, stacking order, and lifecycle transitions.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover string keys.
 * @template TSlices - Tuple of custom StoreSliceDescriptor instances.
 */
export function createPopoverStore<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  const TSlices extends readonly unknown[] = readonly unknown[],
>(
  resolveData: PopoverResolver<TData, TContext>,
  options: PopoverStoreOptions<TData, TContext, TPopoverKey, TSlices>,
  cache?: PopoverCache<TData>,
): StoreApi<
  PopoverStore<TData, TContext, TPopoverKey, InferSliceActionsFromTuple<TSlices>> &
    InferSliceStateFromTuple<TSlices>
> & { dispose: () => void; [DISPOSE_SYMBOL]: () => void };

export function createPopoverStore<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  resolveData: PopoverResolver<TData, TContext>,
  initialContext?: TContext,
  cache?: PopoverCache<TData>,
): StoreApi<PopoverStore<TData, TContext, TPopoverKey>> & {
  dispose: () => void;
  [DISPOSE_SYMBOL]: () => void;
};

export function createPopoverStore<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  const TSlices extends readonly unknown[] = readonly unknown[],
>(
  resolveData: PopoverResolver<TData, TContext>,
  initialContextOrOptions?: TContext | PopoverStoreOptions<TData, TContext, TPopoverKey, TSlices>,
  cache?: PopoverCache<TData>,
): StoreApi<
  PopoverStore<TData, TContext, TPopoverKey, InferSliceActionsFromTuple<TSlices>> &
    InferSliceStateFromTuple<TSlices>
> & { dispose: () => void; [DISPOSE_SYMBOL]: () => void } {
  const isOptions =
    typeof initialContextOrOptions === 'object' &&
    initialContextOrOptions !== null &&
    ('customSlices' in initialContextOrOptions ||
      'cache' in initialContextOrOptions ||
      'initialContext' in initialContextOrOptions);

  const options = isOptions
    ? (initialContextOrOptions as PopoverStoreOptions<TData, TContext, TPopoverKey, TSlices>)
    : undefined;

  const effectiveContext = options
    ? options.initialContext
    : (initialContextOrOptions as TContext | undefined);
  const effectiveCache = options?.cache ?? cache ?? new SimplePopoverCache<TData>();
  const customSlices = options?.customSlices as
    | readonly StoreSliceDescriptor<object, object, TData, TContext, TPopoverKey>[]
    | undefined;

  const controllerManager = createControllerManager<TData>();
  const hydrationManager = createHydrationManager();
  const popoverDAG = new PopoverDAG<TPopoverKey>();
  const batchingManager = createBatchingManager();
  const transitionScheduler = new PopoverTransitionScheduler();
  const historyManager = createHistoryManager<TData, TPopoverKey>(30);
  const eventListeners = new Set<(event: PopoverStoreEvent<TData>) => void>();
  const eventBus = new PopoverEventBus<TData, TPopoverKey>();
  const middlewareEngine = new PopoverMiddlewareEngine<TData, TContext, TPopoverKey>();

  if (customSlices) {
    for (const slice of customSlices) {
      if (slice.middleware) {
        middlewareEngine.use(slice.middleware);
      }
    }
  }

  const baseInitialState = getInitialStoreState<TData, TContext, TPopoverKey>(
    resolveData,
    effectiveContext,
    effectiveCache,
  );

  const mergedInitialState = {
    ...baseInitialState,
  } as PopoverStateData<TData, TContext, TPopoverKey> & InferSliceStateFromTuple<TSlices>;
  if (customSlices) {
    for (const slice of customSlices) {
      if (slice.initialState) {
        Object.assign(mergedInitialState, slice.initialState);
      }
    }
  }

  type CombinedStore = PopoverStore<
    TData,
    TContext,
    TPopoverKey,
    InferSliceActionsFromTuple<TSlices>
  > &
    InferSliceStateFromTuple<TSlices>;

  let storeInstance: StoreApi<CombinedStore> | null = null;

  const store = createStore<CombinedStore>((set, get) => {
    const safeSet = (
      partial:
        | StatePatch<TData, TContext, TPopoverKey>
        | ((
            state: PopoverStore<TData, TContext, TPopoverKey>,
          ) => StatePatch<TData, TContext, TPopoverKey>),
    ) => {
      set((state) => {
        const patch = typeof partial === 'function' ? partial(state) : partial;
        const nextPatch = middlewareEngine.apply(patch, state);

        if (!nextPatch) return state;
        if (typeof nextPatch === 'object' && isEmptyOwnObject(nextPatch)) return state;

        // Zustand shallow-merges the partial into a fresh state object itself,
        // so returning the patch directly avoids a second full-state copy
        // on every dispatch. The cast bridges the generic PopoverStore patch
        // and the custom-slice-extended CombinedStore view of the same state.
        return nextPatch as CombinedStore;
      });
    };

    const resetStoreState = () => {
      controllerManager.abortControllersForKeys(controllerManager.activeControllers.keys());
      transitionScheduler.clear();
      popoverDAG.clear();
      historyManager.clearHistory();
      hydrationManager.resetHydrationCounters();

      safeSet({
        ownerId: null,
        trail: EMPTY_ARRAY,
        floating: EMPTY_ARRAY,
        offsets: EMPTY_OBJECT as Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>,
        pinnedStates: EMPTY_OBJECT as Readonly<Partial<Record<TPopoverKey, boolean>>>,
        zIndexOrder: EMPTY_ARRAY,
        rootHydrationRequestCounter: 0,
        nestedHydrationRequestCounters: EMPTY_OBJECT as Readonly<
          Partial<Record<TPopoverKey, number>>
        >,
        anchorElement: null,
        anchorRect: null,
      });
    };

    const findEntryByKey = (key: string): TrailEntry<TData, TPopoverKey> | undefined => {
      const { floating, trail } = get();
      return findEntryInStore(floating, trail, key);
    };

    const resolverPipelineDeps = {
      popoverDAG,
      cache: effectiveCache,
      resolveData,
      initialContext: effectiveContext,
      inFlightPromises: controllerManager.inFlightPromises,
      registerController: controllerManager.registerController,
      removeController: controllerManager.removeController,
      safeSet,
      findEntryByKey,
      eventBus,
      eventListeners,
    };

    const boundResolvePopoverEntry = (
      params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
    ) => resolvePopoverEntry(get, params, resolverPipelineDeps);

    const dependencies: ActionRegistryDependencies<TData, TContext, TPopoverKey> = {
      activeControllers: controllerManager.activeControllers,
      inFlightPromises: controllerManager.inFlightPromises,
      transitionScheduler,
      eventBus,
      eventListeners,
      abortControllersForKeys: controllerManager.abortControllersForKeys,
      resetStoreState,
      incrementRootCounter: hydrationManager.incrementRootCounter,
      isRootStale: hydrationManager.isRootStale,
      incrementNestedCounter: hydrationManager.incrementNestedCounter,
      isNestedStale: hydrationManager.isNestedStale,
      markAllCountersStale: hydrationManager.markAllCountersStale,
      findEntryByKey,
      resolvePopoverEntry: boundResolvePopoverEntry,
      pushSnapshot: historyManager.pushSnapshot,
      clearHistory: historyManager.clearHistory,
      undoStack: historyManager.undoStack,
      redoStack: historyManager.redoStack,
      historyManager,
      startBatch: batchingManager.startBatch,
      endBatch: () => batchingManager.endBatch(get),
      middlewareEngine,
      cache: effectiveCache,
      popoverDAG,
      subscribeState: (listener) => (storeInstance ? storeInstance.subscribe(listener) : () => {}),
      customSlices,
    };

    const actions = Object.freeze(
      createStoreActions<TData, TContext, TPopoverKey, InferSliceActionsFromTuple<TSlices>>(
        safeSet,
        get,
        dependencies,
      ),
    );

    const rawStoreState = {
      ...mergedInitialState,
      ...actions,
      get actions() {
        return actions;
      },
    };

    return rawStoreState satisfies object as CombinedStore;
  });

  storeInstance = store;
  batchingManager.attachSubscriber(store);

  const dependenciesForDispose: ActionRegistryDependencies<TData, TContext, TPopoverKey> = {
    activeControllers: controllerManager.activeControllers,
    inFlightPromises: controllerManager.inFlightPromises,
    transitionScheduler,
    eventBus,
    eventListeners,
    abortControllersForKeys: controllerManager.abortControllersForKeys,
    resetStoreState: () => {},
    incrementRootCounter: hydrationManager.incrementRootCounter,
    isRootStale: hydrationManager.isRootStale,
    incrementNestedCounter: hydrationManager.incrementNestedCounter,
    isNestedStale: hydrationManager.isNestedStale,
    markAllCountersStale: hydrationManager.markAllCountersStale,
    findEntryByKey: (k) => findEntryInStore(store.getState().floating, store.getState().trail, k),
    resolvePopoverEntry: async () => {},
    pushSnapshot: historyManager.pushSnapshot,
    clearHistory: historyManager.clearHistory,
    undoStack: historyManager.undoStack,
    redoStack: historyManager.redoStack,
    historyManager,
    startBatch: batchingManager.startBatch,
    endBatch: () => {},
    middlewareEngine,
    cache: effectiveCache,
    popoverDAG,
    customSlices,
  };

  const dispose = () => {
    if (customSlices) {
      const sliceCtx: SliceContext<TData, TContext, TPopoverKey> = {
        set: (partial, replace) => {
          if (replace) {
            store.setState(partial as CombinedStore, true);
          } else {
            store.setState(partial as Partial<CombinedStore>);
          }
        },
        get: store.getState,
        deps: dependenciesForDispose,
      };

      for (const slice of customSlices) {
        if (slice.dispose) {
          const disposeResult = wrapResult(() => slice.dispose?.(sliceCtx));
          if (isErr(disposeResult)) {
            console.error(
              `[popover-trail]: Error in slice "${slice.name}" dispose hook:`,
              disposeResult.error,
            );
          }
        }
      }
    }
    store.getState().destroy();
    controllerManager.dispose();
    transitionScheduler.dispose();
    eventBus.clear();
    eventListeners.clear();
    popoverDAG.clear();
    middlewareEngine.dispose();
    batchingManager.dispose();
  };

  Object.assign(store, {
    dispose,
    [DISPOSE_SYMBOL]: dispose,
  });

  return store as StoreApi<
    PopoverStore<TData, TContext, TPopoverKey, InferSliceActionsFromTuple<TSlices>> &
      InferSliceStateFromTuple<TSlices>
  > & { dispose: () => void; [DISPOSE_SYMBOL]: () => void };
}
