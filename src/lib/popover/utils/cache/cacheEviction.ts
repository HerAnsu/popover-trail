/**
 * Eviction coordinator for LRU order and capacity/weight budgets.
 *
 * @module cache/cacheEviction
 */

import type { CacheEntry, StorageAdapter } from './cacheTypes';
import type { CacheWeightTracker } from './cacheWeightTracker';

export interface EvictionTarget {
  readonly key: string;
  readonly reason: 'expired' | 'lru' | 'weight';
}

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
