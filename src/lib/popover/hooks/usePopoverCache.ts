/**
 * Reactive hook for popover cache access, mutations, invalidation, and telemetry.
 *
 * @module hooks/usePopoverCache
 */

import { useContext, useMemo } from 'react';
import type { PopoverCache } from '../types';
import { PopoverStoreContext } from '../context/PopoverStoreContext';
import { isRecordObject } from '../utils/typeGuards';
import { isExtendedCache, type UsePopoverCacheResult } from './usePopoverCacheTypes';

export type { UsePopoverCacheResult };

function isUpdaterFn<TData>(
  val: TData | ((prev: TData | undefined) => TData),
): val is (prev: TData | undefined) => TData {
  return typeof val === 'function';
}

function isStoreWithGetState<TData>(
  val: unknown,
): val is { getState: () => { cache?: PopoverCache<TData> } } {
  return isRecordObject(val) && typeof val.getState === 'function';
}

function resolveActiveCache<TData>(
  customCache?: PopoverCache<TData>,
  storeCtx?: unknown,
): PopoverCache<TData> | undefined {
  if (customCache) return customCache;
  if (isStoreWithGetState<TData>(storeCtx)) {
    return storeCtx.getState().cache;
  }
  return undefined;
}

export function usePopoverCache<TData = unknown>(
  customCache?: PopoverCache<TData>,
): UsePopoverCacheResult<TData> {
  const storeCtx = useContext(PopoverStoreContext);
  const cache = useMemo(() => resolveActiveCache(customCache, storeCtx), [customCache, storeCtx]);
  const ext = isExtendedCache<TData>(cache) ? cache : undefined;

  return useMemo(
    () => ({
      cache,
      get: (key: string) => cache?.get(key),
      set: (key: string, data: TData, ttlMs?: number) => cache?.set(key, data, ttlMs),
      mutate: (key: string, updater: TData | ((prev: TData | undefined) => TData)) => {
        if (!cache) return undefined;
        if (ext && typeof ext.mutate === 'function') return ext.mutate(key, updater);
        const prev = cache.get(key);
        const resolvedPrev = prev instanceof Promise ? undefined : prev;
        const next = isUpdaterFn(updater) ? updater(resolvedPrev) : updater;
        cache.set(key, next);
        return next;
      },
      invalidate: (key?: string) => {
        if (!cache) return;
        if (key !== undefined) cache.delete(key);
        else cache.clear();
      },
      invalidatePrefix: (prefix: string) =>
        ext?.invalidatePrefix ? ext.invalidatePrefix(prefix) : 0,
      invalidateTags: (tags: string | readonly string[]) =>
        ext?.invalidateTags ? ext.invalidateTags(tags) : 0,
      invalidateBranch: (
        rootKey: string,
        getChildren: (key: string) => Iterable<string> | undefined,
      ) => (ext?.invalidateBranch ? ext.invalidateBranch(rootKey, getChildren) : 0),
      touch: (key: string, extensionMs?: number) =>
        ext?.touch ? ext.touch(key, extensionMs) : false,
      getStats: () => ext?.stats?.(),
    }),
    [cache, ext],
  );
}
