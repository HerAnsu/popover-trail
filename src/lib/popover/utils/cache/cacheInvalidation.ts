/**
 * Invalidation utilities for prefix, pattern, tag, and expired entries.
 *
 * @module cache/cacheInvalidation
 */

import type { CacheEntry, StorageAdapter } from './cacheTypes';

function invalidateMatching<T>(
  storage: StorageAdapter<T>,
  predicate: (key: string, entry: CacheEntry<T> | undefined) => boolean,
): number {
  let count = 0;
  for (const key of storage.keys()) {
    if (predicate(key, storage.get(key))) {
      storage.delete(key);
      count++;
    }
  }
  return count;
}

export function pruneExpiredEntries<T>(storage: StorageAdapter<T>, now = Date.now()): number {
  return invalidateMatching(storage, (_, entry) => Boolean(entry && now > entry.expiry));
}

export function invalidateByPrefix<T>(storage: StorageAdapter<T>, prefix: string): number {
  return invalidateMatching(storage, (key) => key.startsWith(prefix));
}

export function invalidateByPattern<T>(storage: StorageAdapter<T>, regex: RegExp): number {
  return invalidateMatching(storage, (key) => regex.test(key));
}

export function invalidateByTags<T>(
  storage: StorageAdapter<T>,
  targetTags: readonly string[],
): number {
  const tagSet = new Set(targetTags);
  return invalidateMatching(storage, (_, entry) =>
    Boolean(entry?.tags?.some((tag) => tagSet.has(tag))),
  );
}
