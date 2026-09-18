/**
 * Dependency Service Contracts for Store Action Registry.
 *
 * @module storeActionRegistryTypes
 */

import type {
  PopoverCache,
  PopoverStore,
  PopoverStoreEvent,
  TrailEntry,
  StoreSliceDescriptor,
} from '../../types';
import type { PopoverMiddlewareEngine } from '../middleware/storeMiddlewareEngine';
import type { PopoverEventBus } from '../eventBus/eventBusCore';
import type { PopoverDAG } from '../../utils/dag';
import type { Effect } from '../effects';
import type { PopoverFSMRegistry } from '../fsm/fsmRegistry';
import type {
  StoreAsyncPipelineService,
  StoreTimerService,
  StoreHistoryService,
} from './storeActionServices';

export * from './storeActionServices';

export interface StoreInfrastructureService<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  eventListeners: Set<(event: PopoverStoreEvent<TData, TPopoverKey>) => void>;
  eventBus: PopoverEventBus<TData, TPopoverKey>;
  emitStoreEvent: (event: PopoverStoreEvent<TData, TPopoverKey>) => void;
  dispatchEffects: (effects: readonly Effect<TData, TPopoverKey, TContext>[]) => void;
  resetStoreState: () => void;
  findEntryByKey: (key: string) => TrailEntry<TData, TPopoverKey> | undefined;
  startBatch: () => void;
  endBatch: () => void;
  middlewareEngine: PopoverMiddlewareEngine<TData, TContext, TPopoverKey>;
  cache?: PopoverCache<TData>;
  popoverDAG?: PopoverDAG<TPopoverKey>;
  fsmRegistry?: PopoverFSMRegistry<TData, TPopoverKey>;
  subscribeState?: (
    listener: (
      state: PopoverStore<TData, TContext, TPopoverKey>,
      prevState: PopoverStore<TData, TContext, TPopoverKey>,
    ) => void,
  ) => () => void;
  readonly customSlices?: readonly StoreSliceDescriptor<
    object,
    object,
    TData,
    TContext,
    TPopoverKey
  >[];
  scheduleTransition?: (callback: () => void) => void;
}

export interface ActionRegistryDependencies<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>
  extends
    StoreAsyncPipelineService<TData, TContext, TPopoverKey>,
    StoreTimerService<TPopoverKey>,
    StoreHistoryService<TData, TContext, TPopoverKey>,
    StoreInfrastructureService<TData, TContext, TPopoverKey> {}
