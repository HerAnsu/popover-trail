/**
 * Configuration parsing and normalization for cache initialization.
 *
 * @module cache/cacheConfigParser
 */

import type { CacheOptions, StorageAdapter } from './cacheTypes';
import { MemoryStorageAdapter } from './cacheStorage';

export const DEFAULT_CACHE_TTL_MS = 300000;
export const DEFAULT_CACHE_MAX_SIZE = 500;

export interface ParsedCacheOptions<T> {
  readonly ttl: number;
  readonly maxSize: number;
  readonly maxWeight?: number;
  readonly storage: StorageAdapter<T>;
  readonly channelName?: string;
}

export function parseCacheOptions<T>(
  ttlOrOpts: number | CacheOptions<T> = DEFAULT_CACHE_TTL_MS,
  defaultSize = DEFAULT_CACHE_MAX_SIZE,
): ParsedCacheOptions<T> {
  const isObj = typeof ttlOrOpts === 'object' && ttlOrOpts !== null;
  const rawTtl = isObj
    ? ttlOrOpts.ttlMs
    : typeof ttlOrOpts === 'number'
      ? ttlOrOpts
      : DEFAULT_CACHE_TTL_MS;
  const rawSize = isObj ? (ttlOrOpts.maxSize ?? defaultSize) : defaultSize;

  return {
    ttl:
      typeof rawTtl === 'number' && Number.isFinite(rawTtl) && rawTtl > 0
        ? rawTtl
        : DEFAULT_CACHE_TTL_MS,
    maxSize: Number.isFinite(rawSize) && rawSize > 0 ? rawSize : DEFAULT_CACHE_MAX_SIZE,
    maxWeight: isObj ? ttlOrOpts.maxWeight : undefined,
    storage: isObj && ttlOrOpts.storage ? ttlOrOpts.storage : new MemoryStorageAdapter<T>(),
    channelName: isObj ? ttlOrOpts.channelName : undefined,
  };
}
