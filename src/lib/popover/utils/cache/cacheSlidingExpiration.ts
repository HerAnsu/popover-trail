/**
 * Sliding TTL evaluation and active cache touch algorithms.
 *
 * @module cache/cacheSlidingExpiration
 */

import type { CacheEntry, StorageAdapter } from './cacheTypes';
import { isValidStorageKey } from '../safeKeys';
import { clamp } from '../math';

export interface TouchOptions {
  readonly extensionMs: number;
  readonly maxLifetimeMs?: number;
}

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
