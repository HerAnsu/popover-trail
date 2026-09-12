/**
 * Single Entry Resolution Pipeline Facade for popover-trail.
 *
 * @module store/resolver/resolvePopoverEntry
 */

import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore } from '../../types';
import { findEntryInStore } from '../../utils/storeHelpers';
import { getPerformanceTimestamp } from './resolverTelemetry';
import { awaitInFlightResolution } from './pipelineExecution';
import type { ResolverPipelineDependencies, ResolvePopoverEntryParams } from './resolverTypes';
import {
  createEntryBuilder,
  insertLoadingEntry,
  tryResolveCacheOrSync,
} from './resolvePopoverHelpers';

export type { ResolverPipelineDependencies, ResolvePopoverEntryParams };

/**
 * Orchestrates the full resolution pipeline for a single popover entry.
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
  const startTime = getPerformanceTimestamp();
  deps.popoverDAG.addNode(params.key, params.parentKey);

  const state = get();
  const existing = findEntryInStore(state.floating, state.trail, params.key);
  const buildEntry = createEntryBuilder(params, existing);
  const requestCounter = params.incrementCounter();

  const isComplete = tryResolveCacheOrSync({
    state,
    params,
    deps,
    existing,
    buildEntry,
    requestCounter,
    startTime,
  });
  if (isComplete) return;

  const inFlight = deps.inFlightPromises.get(params.key);
  if (!inFlight) return;

  insertLoadingEntry(params, deps.safeSet, existing);
  await awaitInFlightResolution({
    inFlight,
    key: params.key,
    requestCounter,
    resolveParams: params,
    deps,
    storeCache: state.cache,
    startTime,
    isDeduped: true,
    buildEntry,
  });
}

export { invokeResolverSafely } from './resolverArity';
