/**
 * Result Handlers for Resolution Success and Failure.
 *
 * @module store/resolver/resolverResultHandler
 */

import type { TrailEntry, PopoverCache } from '../../types';
import { toError } from '../../utils/storeHelpers';
import { safeCallback } from '../../utils/safeCallback';
import { dispatchStoreEvent } from '../eventBus';
import { ABORT_ERROR_NAME } from '../constants';
import { createResolvedTrailEntry, createErrorEntry } from '../reducers';
import { commitResolverSettlement } from './resolverSettlement';
import { recordResolutionMetric } from './resolverTelemetry';
import type { ResolverPipelineDependencies, ResolvePopoverEntryParams } from './resolverTypes';

const saveToCache = <TData>(
  cache: PopoverCache<TData> | null | undefined,
  key: string,
  data: TData,
): void => {
  try {
    cache?.set(key, data);
  } catch {
    /* Ignore cache set errors */
  }
};

const resolveErrorEntry = <TData, TPopoverKey extends string>(
  key: TPopoverKey,
  current: TrailEntry<TData, TPopoverKey> | undefined,
  error: Error,
  explicitEntry?: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey> =>
  explicitEntry ??
  (current
    ? createResolvedTrailEntry(current, undefined, error, false)
    : createErrorEntry(key, undefined, null, undefined, error));

/**
 * Handles successful data resolution, updates caches, and dispatches telemetry.
 */
export function handleResolverSuccess<TData, TContext, TPopoverKey extends string>(
  data: TData,
  key: TPopoverKey,
  successEntry: TrailEntry<TData, TPopoverKey>,
  params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
  storeCache?: PopoverCache<TData> | null,
  startTime?: number,
  source: 'sync' | 'async' | 'deduped' = 'async',
): void {
  const { cache, eventListeners, eventBus, safeSet } = deps;

  saveToCache(storeCache ?? cache, key, data);
  dispatchStoreEvent(eventListeners, { type: 'resolve_success', key, data }, eventBus);

  if (startTime !== undefined) recordResolutionMetric(deps, key, source, startTime, true);

  safeSet((state) => commitResolverSettlement(state, key, successEntry, params));
}

/**
 * Handles resolution errors, invokes custom onError callbacks, and dispatches error telemetry.
 */
export function handleResolverError<TData, TContext, TPopoverKey extends string>(
  objErr: unknown,
  key: TPopoverKey,
  deps: ResolverPipelineDependencies<TData, TContext, TPopoverKey>,
  params?: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  errorEntry?: TrailEntry<TData, TPopoverKey>,
  startTime?: number,
): void {
  const error = toError(objErr);
  if (error.name === ABORT_ERROR_NAME) return;

  const { eventListeners, eventBus, findEntryByKey, safeSet } = deps;
  dispatchStoreEvent(eventListeners, { type: 'resolve_error', key, error }, eventBus);

  if (startTime !== undefined) recordResolutionMetric(deps, key, 'async', startTime, false, error);

  const currentEntry = findEntryByKey(key);
  if (currentEntry?.onError) {
    safeCallback(currentEntry.onError, [error, key], { contextName: 'onError' });
  }

  const target = resolveErrorEntry(key, currentEntry, error, errorEntry);
  safeSet((state) => commitResolverSettlement(state, key, target, params));
}
