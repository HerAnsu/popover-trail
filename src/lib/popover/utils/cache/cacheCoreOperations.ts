/**
 * Core read and write algorithms for the cache engine.
 *
 * @module cache/cacheCoreOperations
 */

import type { CacheSetOptions, StorageAdapter } from './cacheTypes';
import type { CacheStatsTracker } from './cacheStatsTracker';
import type { CacheEventEmitter } from './cacheEventEmitter';
import { isValidStorageKey } from '../safeKeys';
import { ensureCapacity } from './cacheEviction';
import { estimateByteWeight } from './cacheWeightEstimator';

import { handlePromiseRejection } from './cacheRejection';

export function readCacheEntry<T>(
  storage: StorageAdapter<T>,
  stats: CacheStatsTracker,
  events: CacheEventEmitter<T>,
  key: string,
): T | undefined {
  if (!isValidStorageKey(key)) return undefined;
  const entry = storage.get(key);
  if (!entry || Date.now() > entry.expiry) {
    if (entry) {
      storage.delete(key);
      if (events.hasListeners('evict')) events.emit('evict', { key, reason: 'expired' });
    }
    stats.recordMiss();
    if (events.hasListeners('miss')) events.emit('miss', { key });
    return undefined;
  }
  stats.recordHit();
  if (events.hasListeners('hit')) events.emit('hit', { key, value: entry.data });
  storage.delete(key);
  storage.set(key, entry);
  return entry.data;
}

export function writeCacheEntry<T>(
  storage: StorageAdapter<T>,
  maxSize: number,
  defaultTtl: number,
  events: CacheEventEmitter<T>,
  key: string,
  data: T,
  ttlOrOpts?: number | CacheSetOptions,
  onEvict?: (key: string, reason: 'expired' | 'lru' | 'weight') => void,
): void {
  if (!isValidStorageKey(key)) return;
  const evictCb =
    onEvict ??
    ((k, r) => {
      if (events.hasListeners('evict')) events.emit('evict', { key: k, reason: r });
    });
  ensureCapacity(storage, maxSize, key, evictCb);
  const opts = typeof ttlOrOpts === 'object' && ttlOrOpts !== null ? ttlOrOpts : undefined;
  const rawTtl = opts ? opts.ttlMs : ttlOrOpts;
  const ttl =
    typeof rawTtl === 'number' && Number.isFinite(rawTtl) && rawTtl > 0 ? rawTtl : defaultTtl;
  const now = Date.now();
  const weight = opts?.weight ?? (opts?.autoEstimateWeight ? estimateByteWeight(data) : undefined);
  storage.set(key, {
    data,
    expiry: now + ttl,
    staleAt: opts?.staleMs !== undefined ? now + opts.staleMs : undefined,
    tags: opts?.tags,
    weight,
    createdAt: now,
  });
  handlePromiseRejection(storage, key, data);
  if (events.hasKeySubscribers(key)) events.notify(key, data);
}

export function hasCacheEntry<T>(storage: StorageAdapter<T>, key: string): boolean {
  if (!isValidStorageKey(key)) return false;
  const entry = storage.get(key);
  if (entry && Date.now() > entry.expiry) {
    storage.delete(key);
    return false;
  }
  return entry !== undefined;
}
