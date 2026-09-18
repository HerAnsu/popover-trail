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

/**
 * Scans storage and purges all entries whose expiration timestamp is less than `now`.
 *
 * @template T - The stored entry value type.
 * @param storage - The storage adapter backing the cache.
 * @param now - Current timestamp in milliseconds (defaults to Date.now()).
 * @returns The number of expired entries deleted.
 *
 * @example
 * ```ts
 * const purgedCount = pruneExpiredEntries(storage);
 * ```
 */
export function pruneExpiredEntries<T>(storage: StorageAdapter<T>, now = Date.now()): number {
  return invalidateMatching(storage, (_, entry) => Boolean(entry && now > entry.expiry));
}

/**
 * Removes all entries whose keys begin with the given string prefix.
 *
 * @template T - The stored entry value type.
 * @param storage - The storage adapter backing the cache.
 * @param prefix - Prefix string to match (e.g. `user:` or `panel-`).
 * @returns The number of matched entries deleted.
 *
 * @example
 * ```ts
 * const cleared = invalidateByPrefix(storage, 'user:');
 * ```
 */
export function invalidateByPrefix<T>(storage: StorageAdapter<T>, prefix: string): number {
  return invalidateMatching(storage, (key) => key.startsWith(prefix));
}

/**
 * Removes all entries whose keys match a regular expression pattern.
 *
 * @template T - The stored entry value type.
 * @param storage - The storage adapter backing the cache.
 * @param regex - Regular expression to test keys against.
 * @returns The number of matched entries deleted.
 *
 * @example
 * ```ts
 * const cleared = invalidateByPattern(storage, /^session-[0-9]+$/);
 * ```
 */
export function invalidateByPattern<T>(storage: StorageAdapter<T>, regex: RegExp): number {
  return invalidateMatching(storage, (key) => regex.test(key));
}

/**
 * Removes all entries that possess at least one of the specified tags.
 *
 * @template T - The stored entry value type.
 * @param storage - The storage adapter backing the cache.
 * @param targetTags - List of tags to match against entry tags.
 * @returns The number of matched entries deleted.
 *
 * @example
 * ```ts
 * const cleared = invalidateByTags(storage, ['profile', 'avatar']);
 * ```
 */
export function invalidateByTags<T>(
  storage: StorageAdapter<T>,
  targetTags: readonly string[],
): number {
  const tagSet = new Set(targetTags);
  return invalidateMatching(storage, (_, entry) =>
    Boolean(entry?.tags?.some((tag) => tagSet.has(tag))),
  );
}
