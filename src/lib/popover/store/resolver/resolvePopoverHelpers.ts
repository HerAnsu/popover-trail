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

/**
 * Inserts an initial loading placeholder entry into the store.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param params - Popover resolution parameters.
 * @param safeSet - Store state mutation dispatcher.
 * @param existing - Optional existing entry if refreshing.
 *
 * @example
 * ```typescript
 * insertLoadingEntry(params, safeSet, existingEntry);
 * ```
 */
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

/**
 * Extracts the effective active resolver and context from store state and dependencies.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param state - Current store state.
 * @param deps - Pipeline dependencies.
 * @returns Tuple containing active resolver function and current context.
 */
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

/**
 * Creates a memoized entry builder for the given resolution parameters.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param params - Popover resolution parameters.
 * @param existing - Optional existing entry for property preservation.
 * @returns Factory function producing fresh `TrailEntry` instances.
 *
 * @example
 * ```typescript
 * const buildEntry = createEntryBuilder(params, existing);
 * const resolved = buildEntry(data, null, false);
 * ```
 */
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

/**
 * Attempts to resolve popover data synchronously from L1 cache, pre-existing state, or sync resolver.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param ctx - Complete execution context object.
 * @returns True if resolution completed synchronously, false if deferred to asynchronous resolution.
 *
 * @example
 * ```typescript
 * const resolvedSync = tryResolveCacheOrSync(executionContext);
 * ```
 */
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
