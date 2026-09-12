/**
 * Core read and write algorithms for the cache engine.
 *
 * @module cache/cacheCoreOperations
 */

import type { CacheEntry, CacheEntryState, CacheSetOptions, StorageAdapter } from './cacheTypes';
import type { CacheStatsTracker } from './cacheStatsTracker';
import type { CacheEventEmitter } from './cacheEventEmitter';
import { isValidStorageKey } from '../safeKeys';
import { ensureCapacity } from './cacheEviction';
import { estimateByteWeight } from './cacheWeightEstimator';

import { handlePromiseRejection } from './cacheRejection';

/**
 * Retrieves a cached entry by key, validating temporal expiration and updating LRU positioning.
 *
 * @remarks
 * Implements a non-destructive read with LRU re-insertion: if the entry is valid, it is deleted
 * and re-inserted to move it to the most recently used position in iteration-ordered storage.
 * If the entry is expired, it is lazily evicted, triggering an `'evict'` event and recording a miss.
 *
 * @template T - The payload data type.
 * @param storage - Underlying storage adapter holding the cache entries.
 * @param stats - Statistics tracker for hit and miss counters.
 * @param events - Event emitter for cache lifecycle notifications.
 * @param key - Cache key to inspect.
 * @returns The cached payload if valid and unexpired; otherwise `undefined`.
 */
export function readCacheEntry<T>(
  storage: StorageAdapter<T>,
  stats: CacheStatsTracker,
  events: CacheEventEmitter<T>,
  key: string,
): T | undefined {
  if (!isValidStorageKey(key)) return undefined;
  const entry = storage.get(key);

  // Lazy eviction check: purge if expired and record miss
  if (!entry || Date.now() > entry.expiry) {
    if (entry) {
      storage.delete(key);
      if (events.hasListeners('evict')) events.emit('evict', { key, reason: 'expired' });
    }
    stats.recordMiss();
    if (events.hasListeners('miss')) events.emit('miss', { key });
    return undefined;
  }

  // Hit path: record telemetry and refresh LRU position
  stats.recordHit();
  if (events.hasListeners('hit')) events.emit('hit', { key, value: entry.data });

  // Refresh LRU order by deleting and re-inserting at the end of the Map
  storage.delete(key);
  storage.set(key, entry);
  return entry.data;
}

/**
 * Writes or updates an entry in the cache storage, enforcing capacity constraints and calculating metadata.
 *
 * @remarks
 * Prior to insertion, `ensureCapacity` is executed to evict the least recently used or expired items
 * if the total size exceeds `maxSize`. If the payload is a Promise, rejection handlers are attached
 * to automatically purge the pending key upon failure to prevent caching broken promises.
 *
 * @template T - The payload data type.
 * @param storage - Underlying storage adapter.
 * @param maxSize - Maximum item limit before LRU eviction triggers.
 * @param defaultTtl - Default TTL in milliseconds if not specified in `ttlOrOpts`.
 * @param events - Event emitter for cache notifications.
 * @param key - Storage key.
 * @param data - Payload value or promise to store.
 * @param ttlOrOpts - Numerical TTL in milliseconds or structured `CacheSetOptions`.
 * @param onEvict - Optional custom eviction callback.
 */
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

  // Ensure capacity headroom exists before allocating new storage
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

  // Attach rejection listener if data is a Promise, ensuring failure isolation
  handlePromiseRejection(storage, key, data);
  if (events.hasKeySubscribers(key)) events.notify(key, data);
}

/**
 * Checks if a key exists in cache storage and is unexpired.
 *
 * @remarks
 * If the key exists but its TTL has lapsed, it is lazily deleted and returns `false`.
 *
 * @template T - The payload data type.
 * @param storage - Underlying storage adapter.
 * @param key - Storage key to query.
 * @returns `true` if a valid unexpired entry exists, otherwise `false`.
 */
export function hasCacheEntry<T>(storage: StorageAdapter<T>, key: string): boolean {
  if (!isValidStorageKey(key)) return false;
  const entry = storage.get(key);
  if (entry && Date.now() > entry.expiry) {
    storage.delete(key);
    return false;
  }
  return entry !== undefined;
}

/**
 * Evaluates the freshness status of a cache entry.
 *
 * Checks time against expiration thresholds:
 * 1. `expired`: `now > entry.expiry` (past TTL; needs re-fetch or removal).
 * 2. `stale`: `entry.staleAt !== undefined && now >= entry.staleAt` (past freshness window, but still within hard expiry).
 * 3. `fresh`: `now < entry.expiry` and (if configured) `now < entry.staleAt` (fully valid).
 *
 * @remarks
 * Pure and deterministic when passing the `now` timestamp directly.
 *
 * @example
 * ```ts
 * const state = getCacheEntryState(entry, Date.now());
 * if (state.status === 'stale') {
 *   // Serve stale.data immediately, schedule background revalidation
 *   scheduleBackgroundFetch(key);
 * }
 * ```
 *
 * @template T - Payload data type.
 * @param entry - Cache entry to evaluate.
 * @param now - Reference timestamp in milliseconds (defaults to `Date.now()`).
 * @returns Discriminated union of type `CacheEntryState<T>`.
 */
export function getCacheEntryState<T>(
  entry: CacheEntry<T>,
  now = Date.now(),
): CacheEntryState<T> {
  // Phase 1: Hard expiration check takes precedence over soft staleness
  if (now > entry.expiry) {
    return {
      status: 'expired',
      data: entry.data,
      expiry: entry.expiry,
      tags: entry.tags,
    };
  }
  // Phase 2: SWR soft-staleness threshold check
  if (entry.staleAt !== undefined && now >= entry.staleAt) {
    return {
      status: 'stale',
      data: entry.data,
      staleAt: entry.staleAt,
      tags: entry.tags,
    };
  }
  // Phase 3: Within valid fresh bounds
  return {
    status: 'fresh',
    data: entry.data,
    expiry: entry.expiry,
    tags: entry.tags,
  };
}
