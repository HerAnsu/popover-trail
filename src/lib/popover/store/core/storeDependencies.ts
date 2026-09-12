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

export interface StoreDependenciesConfig<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> extends StoreManagers<TData, TContext, TPopoverKey> {
  effectiveCache: PopoverCache<TData>;
  customSlices?: readonly StoreSliceDescriptor<object, object, TData, TContext, TPopoverKey>[];
  findEntryByKey: (key: string) => TrailEntry<TData, TPopoverKey> | undefined;
  resolvePopoverEntry?: (
    params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  ) => Promise<void>;
  resetStoreState: () => void;
  getStoreState: () => PopoverStateData<TData, TContext, TPopoverKey>;
  subscribeState?: (
    listener: (
      s: PopoverStore<TData, TContext, TPopoverKey>,
      p: PopoverStore<TData, TContext, TPopoverKey>,
    ) => void,
  ) => () => void;
}

export function buildStoreDependencies<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  cfg: StoreDependenciesConfig<TData, TContext, TPopoverKey>,
): ActionRegistryDependencies<TData, TContext, TPopoverKey> {
  const dispatchEffects = (effects: readonly Effect<TData, TPopoverKey, TContext>[]) => {
    runEffects<TData, TPopoverKey, TContext>(effects, {
      transitionScheduler: cfg.transitionScheduler,
      popoverDAG: cfg.popoverDAG,
      eventBus: cfg.eventBus,
      eventListeners: cfg.eventListeners,
      abortControllersForKeys: cfg.controllerManager.abortControllersForKeys,
      abortAllControllers: cfg.controllerManager.abortAllControllers,
      pushSnapshot: cfg.historyManager.pushSnapshot,
      getStoreState: cfg.getStoreState,
      findEntryByKey: cfg.findEntryByKey,
      resetStoreState: cfg.resetStoreState,
      scheduleTransition: reactScheduleTransition,
    });
  };

  return {
    activeControllers: cfg.controllerManager.activeControllers,
    inFlightPromises: cfg.controllerManager.inFlightPromises,
    transitionScheduler: cfg.transitionScheduler,
    eventBus: cfg.eventBus,
    eventListeners: cfg.eventListeners,
    emitStoreEvent: (event) => dispatchStoreEvent(cfg.eventListeners, event, cfg.eventBus),
    dispatchEffects,
    abortControllersForKeys: cfg.controllerManager.abortControllersForKeys,
    abortAllControllers: cfg.controllerManager.abortAllControllers,
    resetStoreState: cfg.resetStoreState,
    ...cfg.hydrationManager,
    findEntryByKey: cfg.findEntryByKey,
    resolvePopoverEntry: cfg.resolvePopoverEntry ?? (async () => {}),
    ...cfg.historyManager,
    historyManager: cfg.historyManager,
    startBatch: cfg.batchingManager.startBatch,
    endBatch: () => cfg.batchingManager.endBatch(cfg.getStoreState),
    middlewareEngine: cfg.middlewareEngine,
    cache: cfg.effectiveCache,
    popoverDAG: cfg.popoverDAG,
    subscribeState: cfg.subscribeState ?? (() => () => {}),
    customSlices: cfg.customSlices,
    fsmRegistry: cfg.fsmRegistry,
    scheduleTransition: reactScheduleTransition,
  };
}
