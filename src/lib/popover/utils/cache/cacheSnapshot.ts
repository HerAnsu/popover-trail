/**
 * Snapshot serialization and prototype-safe restoration.
 *
 * @module cache/cacheSnapshot
 */

import type { CacheEntry, StorageAdapter } from './cacheTypes';
import type { CacheEventEmitter } from './cacheEventEmitter';
import { isValidStorageKey } from '../safeKeys';
import { ensureCapacity } from './cacheEviction';
import { isArray } from '../guards/arrayGuards';

function isValidSnapshotEntry<T>(entry: unknown): entry is CacheEntry<T> {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    'expiry' in entry &&
    typeof entry.expiry === 'number' &&
    Number.isFinite(entry.expiry) &&
    entry.expiry > 0
  );
}

/**
 * Serializes all entries from a cache storage adapter into an exportable array of key-entry tuples.
 *
 * @template T - Type of payload stored in cache.
 * @param storage - Storage adapter to dump.
 * @returns Array of [key, CacheEntry] tuples representing current storage state.
 *
 * @example
 * ```typescript
 * const entries = exportCacheSnapshot(cache.storage);
 * localStorage.setItem('saved_cache', JSON.stringify(entries));
 * ```
 */
export function exportCacheSnapshot<T>(storage: StorageAdapter<T>): Array<[string, CacheEntry<T>]> {
  return [...storage.entries()];
}

/**
 * Restores cache entries from an exported snapshot into storage with prototype-pollution immunity.
 *
 * @remarks
 * Filters out prototype pollution attempts (`__proto__`, `constructor`, `prototype`), expired entries,
 * and malformed records. Enforces capacity limits using `ensureCapacity`.
 *
 * @template T - Type of payload stored in cache.
 * @param storage - Target storage adapter to populate.
 * @param snapshot - Iterable collection of candidate key-entry tuples.
 * @param maxSize - Maximum storage capacity threshold.
 * @param events - Event emitter to dispatch notifications for restored keys with active subscribers.
 * @returns Total count of valid entries successfully ingested into storage.
 *
 * @example
 * ```typescript
 * const restoredCount = restoreCacheSnapshot(cache.storage, savedEntries, 200, cache.events);
 * console.log(`Restored ${restoredCount} entries`);
 * ```
 */
export function restoreCacheSnapshot<T>(
  storage: StorageAdapter<T>,
  snapshot: Iterable<unknown>,
  maxSize: number,
  events: CacheEventEmitter<T>,
): number {
  let count = 0;
  const now = Date.now();

  for (const item of snapshot) {
    if (!isArray(item) || item.length < 2) continue;
    const [key, entry] = item;
    if (typeof key !== 'string' || !isValidStorageKey(key)) {
      continue;
    }
    if (!isValidSnapshotEntry<T>(entry) || now > entry.expiry) {
      continue;
    }
    ensureCapacity(storage, maxSize, key);
    storage.set(key, entry);
    if (events.hasKeySubscribers(key)) events.notify(key, entry.data);
    count++;
  }

  return count;
}
