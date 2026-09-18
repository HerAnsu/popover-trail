/**
 * Sliding TTL evaluation and active cache touch algorithms.
 *
 * @module cache/cacheSlidingExpiration
 */

import type { CacheEntry, StorageAdapter } from './cacheTypes';
import { isValidStorageKey } from '../safeKeys';
import { clamp } from '../math';

/**
 * Configuration options for extending cache entry lifetime on access.
 */
export interface TouchOptions {
  /** Milliseconds to extend the entry's expiry relative to the current timestamp. */
  readonly extensionMs: number;
  /** Maximum upper bound for the entry lifetime relative to its creation time. */
  readonly maxLifetimeMs?: number;
}

/**
 * Extends the TTL (time-to-live) of an active cache entry (sliding window expiration).
 *
 * If the entry is already expired or has exceeded its `maxLifetimeMs` ceiling,
 * it is deleted from storage and `false` is returned.
 *
 * @template T - The stored entry value type.
 * @param storage - The storage adapter holding the entry.
 * @param key - The cache key to touch.
 * @param opts - Extension duration in milliseconds or a structured `TouchOptions` object.
 * @returns `true` if the entry was found, valid, and successfully refreshed; `false` otherwise.
 *
 * @example
 * ```ts
 * // Extend by 5 seconds on user activity:
 * const refreshed = touchCacheEntry(storage, 'user-session', 5000);
 *
 * // Extend by 5 seconds with a hard 30-minute ceiling:
 * touchCacheEntry(storage, 'auth-token', { extensionMs: 5000, maxLifetimeMs: 1800000 });
 * ```
 */
export function touchCacheEntry<T = unknown>(
  storage: StorageAdapter<T>,
  key: string,
  opts: number | TouchOptions,
): boolean {
  if (!isValidStorageKey(key)) return false;
  const entry = storage.get(key);
  if (!entry) return false;

  const now = Date.now();
  if (now > entry.expiry) {
    storage.delete(key);
    return false;
  }

  const extensionMs = typeof opts === 'number' ? opts : opts.extensionMs;
  const maxLifetimeMs = typeof opts === 'object' ? opts.maxLifetimeMs : undefined;

  let targetExpiry = now + extensionMs;

  if (maxLifetimeMs !== undefined && maxLifetimeMs > 0) {
    const created = entry.createdAt ?? entry.expiry - extensionMs;
    const maxExpiry = created + maxLifetimeMs;
    if (now >= maxExpiry) {
      storage.delete(key);
      return false;
    }
    targetExpiry = clamp(targetExpiry, 0, maxExpiry);
  }

  const updated: CacheEntry<T> = {
    ...entry,
    expiry: targetExpiry,
  };

  storage.set(key, updated);
  return true;
}
