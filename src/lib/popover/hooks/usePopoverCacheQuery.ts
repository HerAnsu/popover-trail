/**
 * Reactive query hook with discriminated union state transitions.
 *
 * @module hooks/usePopoverCacheQuery
 */

import { useCallback, useEffect, useState } from 'react';
import { globalCacheEventRevalidator } from '../utils/cache';
import { usePopoverCache } from './usePopoverCache';
import { asSWRCompatibleCache } from './usePopoverCacheTypes';
import {
  computeInitialQueryState,
  type PopoverCacheQueryState,
  type UsePopoverCacheQueryOptions,
  type UsePopoverCacheQueryResult,
} from './usePopoverCacheQueryTypes';

/**
 * Reactive data query hook with SWR caching, automatic revalidation, and discriminated state transitions.
 *
 * Automatically tracks 'idle' | 'loading' | 'success' | 'error' lifecycle statuses.
 *
 * @template TData - Resolved data payload type.
 * @param key - Cache identifier string.
 * @param fetcher - Optional async fetch function to populate the cache.
 * @param opts - SWR query options including TTL, deduping, and revalidation triggers.
 * @returns Query state discriminated union along with mutate and revalidate functions.
 *
 * @example
 * ```tsx
 * function UserQueryView({ userId }: { userId: string }) {
 *   const { status, data, isLoading } = usePopoverCacheQuery(
 *     `user-${userId}`,
 *     () => fetchUser(userId),
 *     { ttlMs: 60_000 }
 *   );
 *
 *   if (isLoading) return <Spinner />;
 *   if (status === 'error') return <div>Error loading user</div>;
 *   return <div>User: {data?.name}</div>;
 * }
 * ```
 */
export function usePopoverCacheQuery<TData = unknown>(
  key: string,
  fetcher?: () => Promise<TData>,
  opts?: UsePopoverCacheQueryOptions<TData>,
): UsePopoverCacheQueryResult<TData> {
  const { cache, mutate: cacheMutate } = usePopoverCache<TData>();
  const swrCache = asSWRCompatibleCache(cache);
  const isEnabled = opts?.enabled ?? true;

  const [state, setState] = useState<PopoverCacheQueryState<TData>>(() =>
    computeInitialQueryState(key, cache, isEnabled, opts?.initialData),
  );

  useEffect(() => {
    if (!swrCache?.subscribe || !isEnabled) return;
    return swrCache.subscribe(key, (val) => {
      if (val === undefined) return;
      setState((prev) => ({
        ...prev,
        status: 'success',
        data: val,
        error: null,
        isLoading: false,
      }));
    });
  }, [swrCache, key, isEnabled]);

  const revalidate = useCallback(async (): Promise<TData | undefined> => {
    if (!fetcher || !isEnabled) return undefined;
    setState((prev) => ({ ...prev, status: 'loading', isLoading: true, error: null }));
    try {
      const res = swrCache?.getOrSet
        ? await swrCache.getOrSet(key, fetcher, opts)
        : await fetcher();
      setState({ status: 'success', data: res, error: null, isStale: false, isLoading: false });
      return res;
    } catch (err) {
      setState((prev) => ({ ...prev, status: 'error', error: err, isLoading: false }));
      return undefined;
    }
  }, [fetcher, isEnabled, key, opts, swrCache]);

  const shouldFetchOnMount = Boolean(
    isEnabled && fetcher && (opts?.revalidateOnMount !== false || state.status === 'loading'),
  );
  useEffect(() => {
    if (shouldFetchOnMount) void revalidate();
  }, [key, shouldFetchOnMount, revalidate]);

  useEffect(() => {
    if (!fetcher || !isEnabled || (!opts?.revalidateOnFocus && !opts?.revalidateOnReconnect))
      return;
    return globalCacheEventRevalidator.register(() => {
      void revalidate();
    });
  }, [fetcher, isEnabled, opts?.revalidateOnFocus, opts?.revalidateOnReconnect, revalidate]);

  const mutate = useCallback(
    (updater: TData | ((prev: TData | undefined) => TData)) => {
      const next = cacheMutate(key, updater);
      if (next !== undefined) {
        setState({ status: 'success', data: next, error: null, isStale: false, isLoading: false });
      }
      return next;
    },
    [cacheMutate, key],
  );

  const isStale = Boolean(swrCache?.isStale ? swrCache.isStale(key) : false);

  return { ...state, isStale, mutate, revalidate };
}
