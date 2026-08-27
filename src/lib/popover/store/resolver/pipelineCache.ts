/**
 * Pipeline Cache & L1 State Resolution for popover-trail.
 * Manages synchronous cache retrieval and pre-hydrated state matching.
 *
 * @module store/resolver/pipelineCache
 */

import type { PopoverCache } from '../../types';
import { wrapResult, isOk } from '../../utils/result';
import { isPromise } from '../../utils/storeHelpers';
import { dispatchStoreEvent } from '../eventBus';
import type { CacheResolutionAttemptArgs } from './resolverTypes';

/**
 * Reads data synchronously from the provided cache instance.
 *
 * @template TData - Resolved data payload type.
 * @param activeCache - Optional cache instance.
 * @param key - Target popover key.
 * @returns Cached data payload or `undefined`.
 */
export function getSyncCachedData<TData>(
  activeCache: PopoverCache<TData> | undefined,
  key: string,
): TData | undefined {
  if (!activeCache) return undefined;
  const readResult = wrapResult(() => activeCache.get(key));

  if (isOk(readResult)) {
    const raw = readResult.data;
    if (raw !== undefined && !isPromise(raw)) {
      return raw as TData;
    }
  }
  return undefined;
}

/**
 * Attempts to synchronously resolve popover data from the L1 cache or an already
 * hydrated success entry, committing the result through `safeSet` when fresh.
 *
 * @returns `true` if resolved synchronously from cache or state.
 */
export function tryResolveFromCacheOrState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(args: CacheResolutionAttemptArgs<TData, TContext, TPopoverKey>): boolean {
  const {
    cache,
    storeCache,
    existingEntry,
    key,
    forceRefresh,
    requestCounter,
    resolveParams,
    safeSet,
    buildEntry,
    eventListeners,
    eventBus,
  } = args;

  const effectiveCache = cache ?? storeCache ?? undefined;
  const cachedData = getSyncCachedData(effectiveCache, key);

  if (cachedData !== undefined) {
    if (!resolveParams.isStale(requestCounter)) {
      dispatchStoreEvent(
        eventListeners,
        { type: 'resolve_success', key, data: cachedData },
        eventBus,
      );
      safeSet(resolveParams.insertStatePatch(buildEntry(cachedData, null, false)));
    }
    return true;
  }

  if (existingEntry?.status === 'success' && !forceRefresh) {
    if (!resolveParams.isStale(requestCounter)) {
      dispatchStoreEvent(
        eventListeners,
        { type: 'resolve_success', key, data: existingEntry.data as TData },
        eventBus,
      );
      safeSet(resolveParams.insertStatePatch(buildEntry(existingEntry.data, null, false)));
    }
    return true;
  }

  return false;
}
