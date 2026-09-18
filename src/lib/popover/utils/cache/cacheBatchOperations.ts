/**
 * Batch operations for atomic multi-key read, write, and invalidation.
 *
 * @module cache/cacheBatchOperations
 */

import type { CacheSetOptions, StorageAdapter } from './cacheTypes';
import type { CacheStatsTracker } from './cacheStatsTracker';
import type { CacheEventEmitter } from './cacheEventEmitter';
import { readCacheEntry, writeCacheEntry } from './cacheCoreOperations';

/**
 * A tuple representing a key-value entry with optional TTL or set options for batch writes.
 */
export type BatchSetTuple<T> =
  | readonly [key: string, data: T]
  | readonly [key: string, data: T, ttlOrOpts?: number | CacheSetOptions];

/**
 * Retrieves multiple cached entries simultaneously, recording cache hits and misses.
 *
 * @template T - The stored data type.
 * @param storage - The storage adapter backing the cache.
 * @param stats - The cache stats tracker.
 * @param events - The event emitter for hit/miss notifications.
 * @param keys - Array of keys to retrieve.
 * @returns A Map containing only the keys that were found and non-expired with their values.
 *
 * @example
 * ```ts
 * const results = getManyEntries(storage, stats, events, ['card-1', 'card-2']);
 * const card1 = results.get('card-1');
 * ```
 */
export function getManyEntries<T>(
  storage: StorageAdapter<T>,
  stats: CacheStatsTracker,
  events: CacheEventEmitter<T>,
  keys: readonly string[],
): Map<string, T> {
  const result = new Map<string, T>();
  for (const key of keys) {
    const val = readCacheEntry(storage, stats, events, key);
    if (val !== undefined) result.set(key, val);
  }
  return result;
}

/**
 * Writes multiple entries to cache in a single batch operation, triggering capacity checks and eviction as needed.
 *
 * @template T - The stored data type.
 * @param storage - The storage adapter backing the cache.
 * @param maxSize - Maximum entry capacity allowed in the cache.
 * @param defaultTtl - Default time-to-live in milliseconds if not specified per entry.
 * @param events - The event emitter for set notifications.
 * @param entries - Array of `BatchSetTuple` entries to store.
 * @param onEvict - Optional callback invoked when capacity eviction occurs.
 *
 * @example
 * ```ts
 * setManyEntries(storage, 100, 60000, events, [
 *   ['key-1', data1],
 *   ['key-2', data2, { ttl: 30000 }],
 * ]);
 * ```
 */
export function setManyEntries<T>(
  storage: StorageAdapter<T>,
  maxSize: number,
  defaultTtl: number,
  events: CacheEventEmitter<T>,
  entries: readonly BatchSetTuple<T>[],
  onEvict?: (key: string, reason: 'expired' | 'lru' | 'weight') => void,
): void {
  for (const [key, data, ttlOrOpts] of entries) {
    writeCacheEntry(storage, maxSize, defaultTtl, events, key, data, ttlOrOpts, onEvict);
  }
}

/**
 * Deletes multiple keys from cache, counting successfully removed entries.
 *
 * @template T - The stored data type.
 * @param storage - The storage adapter backing the cache.
 * @param keys - Array of keys to delete.
 * @param onDeleted - Optional callback invoked for each successfully deleted key.
 * @returns The total number of keys successfully deleted.
 *
 * @example
 * ```ts
 * const removedCount = deleteManyEntries(storage, ['key-1', 'key-2']);
 * ```
 */
export function deleteManyEntries<T>(
  storage: StorageAdapter<T>,
  keys: readonly string[],
  onDeleted?: (key: string) => void,
): number {
  let count = 0;
  for (const key of keys) {
    if (storage.delete(key)) {
      count++;
      onDeleted?.(key);
    }
  }
  return count;
}
