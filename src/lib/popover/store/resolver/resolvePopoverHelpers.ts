/**
 * Helpers for Single Entry Resolution Pipeline.
 *
 * @module store/resolver/resolvePopoverHelpers
 */

import type { PopoverResolver, PopoverStore, TrailEntry } from '../../types';
import { createTrailEntry, createLoadingEntry } from '../reducers';
import { tryResolveFromCacheOrState } from './pipelineCache';
import { tryLaunchSyncResolver } from './pipelineExecution';
import type { ResolverPipelineDependencies, ResolvePopoverEntryParams } from './resolverTypes';

export interface ResolutionExecutionContext<TData, TContext, TPopoverKey extends string> {
  readonly state: PopoverStore<TData, TContext, TPopoverKey>;
  readonly params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>;
  readonly deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>;
  readonly existing?: TrailEntry<TData, TPopoverKey>;
  readonly buildEntry: (
    data?: TData | null,
    error?: Error | null,
    isLoading?: boolean,
  ) => TrailEntry<TData, TPopoverKey>;
  readonly requestCounter: number;
  readonly startTime: number;
}

export function insertLoadingEntry<TData, TContext, TPopoverKey extends string>(
  params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  safeSet: ResolverPipelineDependencies<TData, TContext, TPopoverKey>['safeSet'],
  existing?: TrailEntry<TData, TPopoverKey>,
): void {
  safeSet(
    params.insertStatePatch(
      createLoadingEntry(params.key, params.parentKey, params.rect, params.options, existing),
    ),
  );
}

export function getExecutionEnvironment<TData, TContext, TPopoverKey extends string>(
  state: PopoverStore<TData, TContext, TPopoverKey>,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
): {
  readonly activeResolver?: PopoverResolver<TData, TContext>;
  readonly currentContext?: TContext;
} {
  return {
    activeResolver: state.resolveData ?? deps.resolveData,
    currentContext: state.context ?? deps.initialContext ?? undefined,
  };
}

export function createEntryBuilder<TData, TContext, TPopoverKey extends string>(
  params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  existing?: TrailEntry<TData, TPopoverKey>,
) {
  return (
    data?: TData | null,
    error?: Error | null,
    isLoading = false,
  ): TrailEntry<TData, TPopoverKey> =>
    createTrailEntry(
      params.key,
      params.parentKey,
      params.rect,
      params.options,
      existing,
      data,
      error,
      isLoading,
    );
}

export function tryResolveCacheOrSync<TData, TContext, TPopoverKey extends string>(
  ctx: ResolutionExecutionContext<TData, TContext, TPopoverKey>,
): boolean {
  const { state, params, deps, existing, buildEntry, requestCounter, startTime } = ctx;
  const { activeResolver, currentContext } = getExecutionEnvironment(state, deps);

  const cached = tryResolveFromCacheOrState(
    {
      cache: deps.cache,
      storeCache: state.cache,
      existingEntry: existing,
      key: params.key,
      forceRefresh: params.options?.forceRefresh,
      requestCounter,
      resolveParams: params,
      safeSet: deps.safeSet,
      buildEntry,
      eventListeners: deps.eventListeners,
      eventBus: deps.eventBus,
    },
    startTime,
  );
  if (cached) return true;

  return tryLaunchSyncResolver({
    key: params.key,
    controllerKey: params.controllerKey,
    parentData: params.parentData,
    activeResolver,
    currentContext,
    forceRefresh: params.options?.forceRefresh,
    requestCounter,
    resolveParams: params,
    deps,
    storeCache: state.cache,
    startTime,
    buildEntry,
  });
}
