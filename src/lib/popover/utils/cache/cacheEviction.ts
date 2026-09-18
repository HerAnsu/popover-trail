/**
 * Eviction coordinator for LRU order and capacity/weight budgets.
 *
 * @module cache/cacheEviction
 */

import type { CacheEntry, StorageAdapter } from './cacheTypes';
import type { CacheWeightTracker } from './cacheWeightTracker';

/**
 * Descriptor representing an eviction candidate and the reason for eviction.
 */
export interface EvictionTarget {
  /** The cache entry key selected for removal. */
  readonly key: string;
  /** Eviction rationale: expired TTL, least-recently-used capacity, or memory weight limit. */
  readonly reason: 'expired' | 'lru' | 'weight';
}

/**
 * Scans cache entries to identify the optimal eviction candidate.
 * Prioritizes expired entries over active entries, falling back to the oldest (LRU) entry.
 *
 * @template T - The stored entry type.
 * @param entries - An iterable sequence of `[key, entry]` pairs.
 * @param now - Current timestamp in milliseconds.
 * @returns The best eviction target candidate, or `undefined` if the iterable is empty.
 *
 * @example
 * ```ts
 * const target = findEvictionCandidate(storage.entries(), Date.now());
 * if (target) {
 *   storage.delete(target.key);
 * }
 * ```
 */
export function findEvictionCandidate<T>(
  entries: Iterable<[string, CacheEntry<T>]>,
  now: number,
): EvictionTarget | undefined {
  let oldestKey: string | undefined;

  for (const [key, entry] of entries) {
    if (now > entry.expiry) {
      return { key, reason: 'expired' };
    }
    if (oldestKey === undefined) {
      oldestKey = key;
    }
  }

  return oldestKey !== undefined ? { key: oldestKey, reason: 'lru' } : undefined;
}

/**
 * Ensures cache storage stays strictly within the `maxSize` cardinality limit.
 * If storage is at or over capacity, repeatedly evicts candidates (expired first, then LRU).
 *
 * @template T - The stored entry type.
 * @param storage - The storage adapter backing the cache.
 * @param maxSize - Maximum allowed number of entries.
 * @param newKey - The incoming key to be written.
 * @param onEvict - Optional callback invoked when an entry is evicted.
 *
 * @example
 * ```ts
 * ensureCapacity(storage, 100, 'new-key', (evictedKey, reason) => {
 *   console.log(`Evicted ${evictedKey} due to ${reason}`);
 * });
 * ```
 */
export function ensureCapacity<T>(
  storage: StorageAdapter<T>,
  maxSize: number,
  newKey: string,
  onEvict?: (key: string, reason: 'expired' | 'lru' | 'weight') => void,
): void {
  if (storage.get(newKey) !== undefined) {
    storage.delete(newKey);
    return;
  }
  while (storage.size >= maxSize && storage.size > 0) {
    const candidate = findEvictionCandidate(storage.entries(), Date.now());
    if (!candidate) break;
    storage.delete(candidate.key);
    onEvict?.(candidate.key, candidate.reason);
  }
}

/**
 * Ensures that total cache memory weight does not exceed the configured weight budget.
 * Continuously evicts candidates until the tracker indicates memory is back within bounds.
 *
 * @template T - The stored entry type.
 * @param storage - The storage adapter backing the cache.
 * @param weights - The `CacheWeightTracker` managing memory weights.
 * @param onEvict - Optional callback invoked when an entry is evicted for weight.
 *
 * @example
 * ```ts
 * ensureWeightBudget(storage, weightTracker, (key) => {
 *   weightTracker.recordEviction(key);
 * });
 * ```
 */
export function ensureWeightBudget<T>(
  storage: StorageAdapter<T>,
  weights: CacheWeightTracker,
  onEvict?: (key: string, reason: 'weight') => void,
): void {
  while (weights.isOverBudget()) {
    const candidate = findEvictionCandidate(storage.entries(), Date.now());
    if (!candidate) break;
    storage.delete(candidate.key);
    onEvict?.(candidate.key, 'weight');
  }
}
