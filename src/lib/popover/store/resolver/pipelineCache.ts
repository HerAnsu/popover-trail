/**
 * Pipeline Cache & L1 State Resolution for popover-trail.
 * Manages synchronous cache retrieval and pre-hydrated state matching.
 *
 * @module store/resolver/pipelineCache
 */

import type { PopoverCache } from '../../types';
import { isPromise } from '../../utils/storeHelpers';
import { isResolvedEntry } from '../../utils/guards/entryGuards';
import { dispatchStoreEvent } from '../eventBus';
import { recordResolutionMetric } from './resolverTelemetry';
import type { CacheResolutionAttemptArgs } from './resolverTypes';

/**
 * Reads synchronous cached data, ignoring promises or retrieval errors.
 */
export function getSyncCachedData<TData>(
  activeCache: PopoverCache<TData> | undefined,
  key: string,
): TData | undefined {
  if (!activeCache) return undefined;
  try {
    const raw = activeCache.get(key);
    return raw !== undefined && !isPromise(raw) ? raw : undefined;
  } catch {
    return undefined;
  }
}

function commitSuccessPayload<TData, TContext, TPopoverKey extends string>(
  data: TData,
  args: CacheResolutionAttemptArgs<TData, TContext, TPopoverKey>,
  startTime?: number,
): void {
  const { resolveParams, requestCounter, eventListeners, key, eventBus, safeSet, buildEntry } =
    args;
  if (resolveParams.isStale(requestCounter)) return;

  dispatchStoreEvent(eventListeners, { type: 'resolve_success', key, data }, eventBus);

  if (startTime !== undefined) {
    recordResolutionMetric(args, key, 'cache', startTime, true);
  }

  safeSet(resolveParams.insertStatePatch(buildEntry(data, null, false)));
}

/**
 * Attempts synchronous resolution from L1 cache or existing success state.
 */
export function tryResolveFromCacheOrState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(args: CacheResolutionAttemptArgs<TData, TContext, TPopoverKey>, startTime?: number): boolean {
  const { cache, storeCache, key, forceRefresh, existingEntry } = args;
  const effectiveCache = cache ?? storeCache ?? undefined;
  const cachedData = getSyncCachedData(effectiveCache, key);

  if (cachedData !== undefined) {
    commitSuccessPayload(cachedData, args, startTime);
    return true;
  }

  if (!forceRefresh && isResolvedEntry<TData, TPopoverKey>(existingEntry)) {
    commitSuccessPayload(existingEntry.data, args, startTime);
    return true;
  }

  return false;
}
