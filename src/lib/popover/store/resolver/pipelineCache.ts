/**
 * Pipeline Cache & L1 State Resolution for popover-trail.
 * Manages synchronous cache retrieval and pre-hydrated state matching.
 *
 * @module store/resolver/pipelineCache
 */

import type { PopoverCache, PopoverStore, TrailEntry } from '../../types';
import { wrapResult, isOk } from '../../utils/result';
import { isPromise } from '../../utils/storeHelpers';
import type { ResolvePopoverEntryParams } from './resolverTypes';

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
 * Attempts to synchronously resolve popover data from L1 memory state or L2 cache.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Popover key string type.
 * @param cache - Global or store-level cache instance.
 * @param storeCache - Per-store cache instance if configured.
 * @param existingEntry - Existing trail entry if already present.
 * @param key - Target popover key.
 * @param forceRefresh - Whether to bypass cache and state.
 * @param requestCounter - Stale request counter.
 * @param params - Resolution parameters.
 * @param safeSet - Zustand safeSet dispatcher.
 * @param buildEntry - Entry builder function.
 * @returns `true` if resolved synchronously from cache or state.
 */
export function tryResolveFromCacheOrState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  cache: PopoverCache<TData> | undefined,
  storeCache: PopoverCache<TData> | null | undefined,
  existingEntry: TrailEntry<TData, TPopoverKey> | undefined,
  key: TPopoverKey,
  forceRefresh: boolean,
  requestCounter: number,
  params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  safeSet: (
    patch: (
      state: PopoverStore<TData, TContext, TPopoverKey>,
    ) => Partial<PopoverStore<TData, TContext, TPopoverKey>>,
  ) => void,
  buildEntry: (
    data?: TData | null,
    error?: Error | null,
    isLoading?: boolean,
  ) => TrailEntry<TData, TPopoverKey>,
): boolean {
  const effectiveCache = cache ?? storeCache ?? undefined;
  const cachedData = getSyncCachedData(effectiveCache, key);

  if (cachedData !== undefined) {
    if (!params.isStale(requestCounter)) {
      safeSet(
        params.insertStatePatch(buildEntry(cachedData, null, false)) as (
          state: PopoverStore<TData, TContext, TPopoverKey>,
        ) => Partial<PopoverStore<TData, TContext, TPopoverKey>>,
      );
    }
    return true;
  }

  if (existingEntry?.status === 'success' && existingEntry.data !== undefined && !forceRefresh) {
    if (!params.isStale(requestCounter)) {
      safeSet(
        params.insertStatePatch(buildEntry(existingEntry.data, null, false)) as (
          state: PopoverStore<TData, TContext, TPopoverKey>,
        ) => Partial<PopoverStore<TData, TContext, TPopoverKey>>,
      );
    }
    return true;
  }

  return false;
}
