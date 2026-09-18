/**
 * Configuration parsing and normalization for cache initialization.
 *
 * @module cache/cacheConfigParser
 */

import type { CacheOptions, StorageAdapter } from './cacheTypes';
import { MemoryStorageAdapter } from './cacheStorage';

export const DEFAULT_CACHE_TTL_MS = 300000;
export const DEFAULT_CACHE_MAX_SIZE = 500;

/**
 * Fully resolved and sanitized configuration options for a cache instance.
 *
 * @template T - Type of payload stored in cache.
 */
export interface ParsedCacheOptions<T> {
  /** Effective time-to-live duration in milliseconds. */
  readonly ttl: number;
  /** Maximum number of items before LRU eviction. */
  readonly maxSize: number;
  /** Optional memory or weight threshold limit. */
  readonly maxWeight?: number;
  /** Underlying storage adapter backend. */
  readonly storage: StorageAdapter<T>;
  /** Optional cross-tab BroadcastChannel name for state synchronization. */
  readonly channelName?: string;
}

/**
 * Normalizes input cache configurations or numerical TTLs into a sanitized options object.
 *
 * @remarks
 * Validates that TTL and capacity numbers are finite positive values, falling back to
 * `DEFAULT_CACHE_TTL_MS` (5 minutes) and `DEFAULT_CACHE_MAX_SIZE` (500 entries) when invalid.
 *
 * @template T - Type of payload stored in cache.
 * @param ttlOrOpts - Numerical TTL in milliseconds or partial `CacheOptions` object.
 * @param defaultSize - Fallback maximum size if not specified (default: 500).
 * @returns Fully validated `ParsedCacheOptions<T>` structure.
 *
 * @example
 * ```typescript
 * const config = parseCacheOptions({ ttlMs: 60000, maxSize: 200 });
 * console.log(config.ttl); // 60000
 * console.log(config.maxSize); // 200
 * ```
 */
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
