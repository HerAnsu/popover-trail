/**
 * Resolver Stage Argument Contracts for Data Resolution Pipeline.
 *
 * @module store/resolver/resolverStageTypes
 */

import type { PopoverResolver, TrailEntry, PopoverCache, PopoverStoreEvent } from '../../types';
import type { PopoverEventBus } from '../eventBus';
import type {
  EntryBuilderFn,
  ResolvePopoverEntryParams,
  ResolverPipelineDependencies,
} from './resolverTypes';

export interface BaseResolutionArgs<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  readonly key: TPopoverKey;
  readonly requestCounter: number;
  readonly resolveParams: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>;
  readonly buildEntry: EntryBuilderFn<TData, TPopoverKey>;
  readonly startTime?: number;
  readonly storeCache?: PopoverCache<TData> | null;
}

export interface AwaitInFlightResolutionArgs<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> extends BaseResolutionArgs<TData, TContext, TPopoverKey> {
  readonly inFlight: Promise<TData>;
  readonly deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>;
  readonly isDeduped?: boolean;
}

export interface SyncResolutionLaunchArgs<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> extends BaseResolutionArgs<TData, TContext, TPopoverKey> {
  readonly controllerKey: string;
  readonly parentData?: TData | null;
  readonly activeResolver?: PopoverResolver<TData, TContext>;
  readonly currentContext?: TContext;
  readonly forceRefresh?: boolean;
  readonly deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>;
}

export interface CacheResolutionAttemptArgs<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> extends BaseResolutionArgs<TData, TContext, TPopoverKey> {
  readonly cache?: PopoverCache<TData>;
  readonly existingEntry?: TrailEntry<TData, TPopoverKey>;
  readonly forceRefresh?: boolean;
  readonly safeSet: ResolverPipelineDependencies<TData, TContext, TPopoverKey>['safeSet'];
  readonly eventListeners?: Set<(event: PopoverStoreEvent<TData, TPopoverKey>) => void>;
  readonly eventBus?: PopoverEventBus<TData, TPopoverKey>;
}
