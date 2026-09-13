/**
 * Batch operations for atomic multi-key read, write, and invalidation.
 *
 * @module cache/cacheBatchOperations
 */

import type { CacheSetOptions, StorageAdapter } from './cacheTypes';
import type { CacheStatsTracker } from './cacheStatsTracker';
import type { CacheEventEmitter } from './cacheEventEmitter';
import { readCacheEntry, writeCacheEntry } from './cacheCoreOperations';

export type BatchSetTuple<T> =
  | readonly [key: string, data: T]
  | readonly [key: string, data: T, ttlOrOpts?: number | CacheSetOptions];

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
