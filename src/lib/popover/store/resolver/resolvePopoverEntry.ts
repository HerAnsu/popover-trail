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
 *
 * Steps in the pipeline:
 * 1. Inserts the key into the cascade DAG under parentKey.
 * 2. Checks L1 cache or existing resolved entry state.
 * 3. Attempts fast-path synchronous resolution.
 * 4. If asynchronous, transitions entry into `isLoading: true` and awaits in-flight resolution.
 * 5. Commits final data or error state.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param get - Store state getter function.
 * @param params - Single entry resolution options (key, parentKey, rect, options).
 * @param deps - Pipeline dependencies (DAG, caches, controllers, buses).
 * @returns Promise resolving when the popover entry state is fully settled.
 *
 * @example
 * ```typescript
 * await resolvePopoverEntry(get, {
 *   key: 'card-1',
 *   parentKey: null,
 *   rect: triggerRect,
 *   options: { forceRefresh: false },
 *   incrementCounter: () => ++counter,
 *   isStale: (cnt) => cnt !== counter,
 *   insertStatePatch: (entry) => ({ trail: [entry] }),
 * }, deps);
 * ```
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

export { invokeResolver } from './resolverArity';
