/**
 * Reactive hook subscribing to a single cache key with SWR resolution.
 *
 * @module hooks/usePopoverCacheValue
 */

import { useCallback, useEffect, useState } from 'react';
import { globalCacheEventRevalidator } from '../utils/cache';
import { isPromise } from '../utils/asyncUtils';
import { usePopoverCache } from './usePopoverCache';
import {
  asSWRCompatibleCache,
  type UsePopoverCacheValueOptions,
  type UsePopoverCacheValueResult,
} from './usePopoverCacheTypes';

export type { UsePopoverCacheValueOptions, UsePopoverCacheValueResult };

export function usePopoverCacheValue<TData = unknown>(
  key: string,
  fetcher?: () => Promise<TData>,
  opts?: UsePopoverCacheValueOptions<TData>,
): UsePopoverCacheValueResult<TData> {
  const { cache, mutate: cacheMutate } = usePopoverCache<TData>();
  const swrCache = asSWRCompatibleCache(cache);

  const [data, setData] = useState<TData | undefined>(() => {
    const cached = cache?.get(key);
    return isPromise(cached) ? opts?.initialData : (cached ?? opts?.initialData);
  });

  const [isLoading, setIsLoading] = useState<boolean>(Boolean(fetcher && data === undefined));
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!swrCache?.subscribe) return;
    return swrCache.subscribe(key, (val) => setData(val));
  }, [swrCache, key]);

  const revalidate = useCallback(async (): Promise<TData | undefined> => {
    if (!fetcher) return undefined;
    setIsLoading(true);
    setError(null);
    try {
      const res = swrCache?.getOrSet
        ? await swrCache.getOrSet(key, fetcher, opts)
        : await fetcher();
      setData(res);
      return res;
    } catch (err) {
      setError(err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, key, opts, swrCache]);

  const shouldFetchOnMount = Boolean(
    fetcher && (opts?.revalidateOnMount !== false || data === undefined),
  );
  useEffect(() => {
    if (shouldFetchOnMount) {
      void revalidate();
    }
  }, [key, shouldFetchOnMount, revalidate]);

  useEffect(() => {
    if (!fetcher || (!opts?.revalidateOnFocus && !opts?.revalidateOnReconnect)) return;
    return globalCacheEventRevalidator.register(() => {
      void revalidate();
    });
  }, [fetcher, opts?.revalidateOnFocus, opts?.revalidateOnReconnect, revalidate]);

  const mutate = useCallback(
    (updater: TData | ((prev: TData | undefined) => TData)) => {
      const next = cacheMutate(key, updater);
      setData(next);
      return next;
    },
    [cacheMutate, key],
  );

  const isStale = Boolean(swrCache?.isStale ? swrCache.isStale(key) : false);

  return { data, isLoading, isStale, error, mutate, revalidate };
}
