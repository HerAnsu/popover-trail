/**
 * Unified Store Action Registry Dependencies Builder.
 *
 * @module storeDependencies
 */

import type {
  PopoverStore,
  PopoverCache,
  TrailEntry,
  StoreSliceDescriptor,
  PopoverStateData,
} from '../../types';
import type { ResolvePopoverEntryParams } from '../storeResolverPipeline';
import type { ActionRegistryDependencies } from '../storeActionRegistry';
import type { StoreManagers } from './storeManagers';
import { dispatchStoreEvent } from '../eventBus';
import { runEffects, type Effect } from '../effects';
import { reactScheduleTransition } from '../../utils/reactTransitions';
import { constant, noop } from '../../utils/functional';

/**
 * Configuration for assembling action registry dependencies.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export interface StoreDependenciesConfig<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> extends StoreManagers<TData, TContext, TPopoverKey> {
  /** Resolved cache instance. */
  effectiveCache: PopoverCache<TData>;
  /** Optional custom store slices. */
  customSlices?: readonly StoreSliceDescriptor<object, object, TData, TContext, TPopoverKey>[];
  /** Lookup function locating a trail or floating entry by key. */
  findEntryByKey: (key: string) => TrailEntry<TData, TPopoverKey> | undefined;
  /** Async resolver function pipeline. */
  resolvePopoverEntry?: (
    params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  ) => Promise<void>;
  /** Teardown function resetting store state. */
  resetStoreState: () => void;
  /** State reader function. */
  getStoreState: () => PopoverStateData<TData, TContext, TPopoverKey>;
  /** State change subscription hook. */
  subscribeState?: (
    listener: (
      s: PopoverStore<TData, TContext, TPopoverKey>,
      p: PopoverStore<TData, TContext, TPopoverKey>,
    ) => void,
  ) => () => void;
}

/**
 * Assembles unified action registry dependencies by bundling all managers, pipelines, and resolvers.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param cfg - Store dependencies configuration bundle.
 * @returns Fully assembled ActionRegistryDependencies object.
 *
 * @example
 * ```typescript
 * const deps = buildStoreDependencies(dependenciesConfig);
 * ```
 */
export function buildStoreDependencies<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  cfg: StoreDependenciesConfig<TData, TContext, TPopoverKey>,
): ActionRegistryDependencies<TData, TContext, TPopoverKey> {
  const {
    transitionScheduler,
    popoverDAG,
    eventBus,
    eventListeners,
    controllerManager,
    historyManager,
    hydrationManager,
    batchingManager,
    middlewareEngine,
    fsmRegistry,
    effectiveCache,
    customSlices,
    findEntryByKey,
    resolvePopoverEntry = async () => {},
    resetStoreState,
    getStoreState,
    subscribeState = constant(noop),
  } = cfg;

  const { abortControllersForKeys, abortAllControllers, activeControllers, inFlightPromises } =
    controllerManager;
  const { pushSnapshot } = historyManager;
  const { startBatch, endBatch } = batchingManager;

  const dispatchEffects = (effects: readonly Effect<TData, TPopoverKey, TContext>[]) => {
    runEffects<TData, TPopoverKey, TContext>(effects, {
      transitionScheduler,
      popoverDAG,
      eventBus,
      eventListeners,
      abortControllersForKeys,
      abortAllControllers,
      pushSnapshot,
      getStoreState,
      findEntryByKey,
      resetStoreState,
      scheduleTransition: reactScheduleTransition,
    });
  };

  return {
    activeControllers,
    inFlightPromises,
    transitionScheduler,
    eventBus,
    eventListeners,
    emitStoreEvent: (event) => dispatchStoreEvent(eventListeners, event, eventBus),
    dispatchEffects,
    abortControllersForKeys,
    abortAllControllers,
    resetStoreState,
    ...hydrationManager,
    findEntryByKey,
    resolvePopoverEntry,
    ...historyManager,
    historyManager,
    startBatch,
    endBatch: () => endBatch(getStoreState),
    middlewareEngine,
    cache: effectiveCache,
    popoverDAG,
    subscribeState,
    customSlices,
    fsmRegistry,
    scheduleTransition: reactScheduleTransition,
  };
}
