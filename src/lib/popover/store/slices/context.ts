/**
 * Context & Dependency Injection Contracts for Popover Store Action Slices.
 *
 * @module store/slices/context
 */

import type { ActionRegistryDependencies } from '../storeActionRegistry';
import type { PopoverDAG } from '../../utils/dag';
import type { Effect } from '../effects';
import type { TrailEntry, PopoverStore, PopoverStoreEvent } from '../../types';
import type { PopoverTransitionScheduler } from '../transitionScheduler';
import type { PopoverMiddlewareEngine } from '../middleware/storeMiddlewareEngine';
import type { HistoryManager } from '../history';
import type { PopoverEventBus } from '../eventBus';
import type { BaseSliceContext } from './sliceContextCore';

export * from './sliceContextCore';

export interface ConfigSliceContext<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> extends BaseSliceContext<TData, TContext, TPopoverKey> {
  readonly deps: {
    readonly transitionScheduler: PopoverTransitionScheduler<TPopoverKey>;
    readonly popoverDAG?: PopoverDAG<TPopoverKey>;
    readonly findEntryByKey: (key: string) => TrailEntry<TData, TPopoverKey> | undefined;
    readonly abortAllControllers?: () => void;
    readonly inFlightPromises?: Map<string, Promise<unknown>>;
    readonly markAllCountersStale?: () => void;
  };
}

export interface TransactionsSliceContext<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> extends BaseSliceContext<TData, TContext, TPopoverKey> {
  readonly deps: {
    readonly activeControllers: Map<string, AbortController>;
    readonly startBatch: () => void;
    readonly endBatch: () => void;
    readonly middlewareEngine: PopoverMiddlewareEngine<TData, TContext, TPopoverKey>;
    readonly historyManager?: HistoryManager<TData, TPopoverKey>;
    readonly popoverDAG?: PopoverDAG<TPopoverKey>;
    readonly dispatchEffects: (effects: readonly Effect<TData, TPopoverKey, TContext>[]) => void;
    readonly scheduleTransition?: (callback: () => void) => void;
  };
}

export interface SubscriptionsSliceContext<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> extends BaseSliceContext<TData, TContext, TPopoverKey> {
  readonly deps: {
    readonly eventListeners: Set<(event: PopoverStoreEvent<TData, TPopoverKey>) => void>;
    readonly eventBus: PopoverEventBus<TData, TPopoverKey>;
    readonly subscribeState?: (
      listener: (
        state: PopoverStore<TData, TContext, TPopoverKey>,
        prevState: PopoverStore<TData, TContext, TPopoverKey>,
      ) => void,
    ) => () => void;
  };
}

export interface SliceContext<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TSliceState extends object = object,
> extends BaseSliceContext<TData, TContext, TPopoverKey, TSliceState> {
  readonly deps: ActionRegistryDependencies<TData, TContext, TPopoverKey>;
}
