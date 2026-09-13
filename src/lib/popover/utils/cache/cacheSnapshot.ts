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

export function exportCacheSnapshot<T>(storage: StorageAdapter<T>): Array<[string, CacheEntry<T>]> {
  return [...storage.entries()];
}

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
