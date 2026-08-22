/**
 * Store Data Resolution Pipeline for popover-trail.
 * Handles async data loading, caching, in-flight deduplication, positional/object resolver fallbacks,
 * and state patch insertion using Monadic Result error handling.
 *
 * @module storeResolverPipeline
 */

import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore, TrailEntry } from '../types';
import { findEntryInStore, createTrailEntry, createLoadingEntry } from '../utils/storeHelpers';
import type {
  ResolverPipelineDependencies,
  ResolvePopoverEntryParams,
  AnyResolverFn,
} from './resolver/resolverTypes';
import { tryResolveFromCacheOrState } from './resolver/pipelineCache';
import {
  invokeResolverSafely,
  tryLaunchSyncResolver,
  awaitInFlightResolution,
} from './resolver/pipelineExecution';

export type { ResolverPipelineDependencies, ResolvePopoverEntryParams, AnyResolverFn };
export { invokeResolverSafely };

/**
 * Resolves popover entry data asynchronously or synchronously and commits state patches to the store.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Popover key string union.
 * @param get - Zustand store getState function.
 * @param params - Resolution parameters.
 * @param deps - Pipeline dependency injection container.
 */
export async function resolvePopoverEntry<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  get: StoreApi<PopoverStore<TData, TContext, TPopoverKey>>['getState'],
  params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
): Promise<void> {
  const {
    key,
    parentKey,
    rect,
    parentData,
    options,
    controllerKey,
    incrementCounter,
    insertStatePatch,
  } = params;
  const { popoverDAG, cache, resolveData, initialContext, inFlightPromises, safeSet } = deps;

  popoverDAG.addNode(key, parentKey);
  const { floating, trail, cache: storeCache } = get();
  const existingEntry = findEntryInStore(floating, trail, key);

  const buildEntry = (
    data?: TData | null,
    error: Error | null = null,
    isLoading = false,
  ): TrailEntry<TData, TPopoverKey> =>
    createTrailEntry(
      key,
      parentKey,
      rect ?? null,
      options,
      // Re-read at call time: the entry may be pinned, dragged, or otherwise
      // mutated while a resolver is in flight. Committing a snapshot taken
      // before the await would revert those mutations on success.
      findEntryInStore(get().floating, get().trail, key),
      data ?? undefined,
      error,
      isLoading,
    );

  const requestCounter = incrementCounter();
  const forceRefresh = Boolean(options?.forceRefresh);

  if (
    tryResolveFromCacheOrState(
      cache,
      storeCache,
      existingEntry,
      key,
      forceRefresh,
      requestCounter,
      params,
      safeSet,
      buildEntry,
      deps.eventListeners,
      deps.eventBus,
    )
  ) {
    return;
  }

  const activeResolver = get().resolveData ?? resolveData;
  const currentContext = (get().context ?? initialContext) as TContext;

  const isResolvedOrErrored = tryLaunchSyncResolver(
    key,
    controllerKey,
    parentData,
    activeResolver,
    currentContext,
    forceRefresh,
    requestCounter,
    params,
    deps,
    storeCache,
    buildEntry,
  );
  if (isResolvedOrErrored) return;

  const inFlight = inFlightPromises.get(key);
  if (!inFlight) return;

  if (existingEntry?.status !== 'success' || forceRefresh) {
    const loadingEntry = createLoadingEntry(key, parentKey, rect ?? null, options, existingEntry);
    safeSet(insertStatePatch(loadingEntry));
  }

  await awaitInFlightResolution(
    inFlight,
    key,
    requestCounter,
    params,
    deps,
    storeCache ?? undefined,
    buildEntry,
  );
}
