/**
 * Base popover cache managing storage, stats, batching, and lifecycle.
 *
 * @module cache/basePopoverCache
 */

import type { PopoverCache } from '../../types';
import type { CacheOptions, CacheSetOptions, CacheStats, StorageAdapter } from './cacheTypes';
import { isValidStorageKey } from '../safeKeys';
import { DISPOSE_SYMBOL } from '../disposable';
import { CacheStatsTracker } from './cacheStatsTracker';
import { CacheEventEmitter } from './cacheEventEmitter';
import { CacheTimerManager } from './cacheTimer';
import { CrossTabSync } from './cacheStorage';
import { hasCacheEntry, readCacheEntry, writeCacheEntry } from './cacheCoreOperations';
import {
  DEFAULT_CACHE_MAX_SIZE,
  DEFAULT_CACHE_TTL_MS,
  parseCacheOptions,
} from './cacheConfigParser';
import {
  type BatchSetTuple,
  deleteManyEntries,
  getManyEntries,
  setManyEntries,
} from './cacheBatchOperations';

/**
 * Foundational popover cache managing in-memory storage, hits/misses telemetry,
 * batching operations, and cross-tab event synchronization.
 *
 * @template TData - Type of data payload stored in the cache.
 *
 * @example
 * ```typescript
 * const cache = new BasePopoverCache<UserProfile>({
 *   ttl: 60_000,
 *   maxSize: 100,
 * });
 * cache.set('user-1', { id: '1', name: 'Alice' });
 * const user = cache.get('user-1');
 * ```
 */
export class BasePopoverCache<TData = unknown> implements PopoverCache<TData> {
  protected readonly storage: StorageAdapter<TData>;
  protected readonly ttl: number;
  protected readonly maxSize: number;
  protected readonly statsTracker = new CacheStatsTracker();
  protected readonly events = new CacheEventEmitter<TData>();
  protected readonly timers = new CacheTimerManager();
  protected readonly crossTab: CrossTabSync;

  /**
   * Initializes a new BasePopoverCache with options or default TTL.
   *
   * @param ttlOrOpts - Number (TTL in ms) or configuration object.
   * @param maxSize - Max entries capacity before LRU eviction.
   */
  constructor(
    ttlOrOpts: number | CacheOptions<TData> = DEFAULT_CACHE_TTL_MS,
    maxSize = DEFAULT_CACHE_MAX_SIZE,
  ) {
    const opts = parseCacheOptions(ttlOrOpts, maxSize);
    this.ttl = opts.ttl;
    this.maxSize = opts.maxSize;
    this.storage = opts.storage;
    this.crossTab = new CrossTabSync(opts.channelName, (k) => this.delete(k));
  }

  /**
   * Retrieves an item from cache if present and unexpired.
   *
   * @param key - Cache key.
   * @returns The cached payload or undefined if missing/expired.
   */
  public get(key: string): TData | undefined {
    return readCacheEntry(this.storage, this.statsTracker, this.events, key);
  }

  /**
   * Stores an item in the cache with optional custom TTL or metadata.
   *
   * @param key - Cache key.
   * @param data - Value payload to store.
   * @param ttlOrOpts - Custom TTL in milliseconds or configuration object.
   */
  public set(key: string, data: TData, ttlOrOpts?: number | CacheSetOptions): void {
    writeCacheEntry(this.storage, this.maxSize, this.ttl, this.events, key, data, ttlOrOpts);
  }

  /**
   * Checks if an unexpired item exists in cache for the specified key.
   *
   * @param key - Cache key to inspect.
   * @returns True if key exists and has not expired.
   */
  public has(key: string): boolean {
    return hasCacheEntry(this.storage, key);
  }

  /**
   * Removes a specific item from cache and notifies subscribers.
   *
   * @param key - Cache key to delete.
   * @returns True if entry existed and was deleted.
   */
  public delete(key: string): boolean {
    if (!isValidStorageKey(key) || !this.storage.delete(key)) return false;
    this.emitInvalidation(key);
    return true;
  }

  /**
   * Clears all entries from storage and resets telemetry stats.
   */
  public clear(): void {
    this.storage.clear();
    this.statsTracker.reset();
  }

  /**
   * Bulk retrieves multiple entries in a single pass.
   *
   * @param keys - Array of cache keys.
   * @returns Map of found key-value pairs.
   */
  public getMany(keys: readonly string[]): Map<string, TData> {
    return getManyEntries(this.storage, this.statsTracker, this.events, keys);
  }

  /**
   * Bulk writes multiple entries into cache in a single transaction.
   *
   * @param entries - Array of `[key, value, optionalOpts]` tuples.
   */
  public setMany(entries: readonly BatchSetTuple<TData>[]): void {
    setManyEntries(this.storage, this.maxSize, this.ttl, this.events, entries);
  }

  /**
   * Bulk deletes multiple keys from cache and emits invalidation events.
   *
   * @param keys - Array of keys to delete.
   * @returns Number of successfully removed entries.
   */
  public deleteMany(keys: readonly string[]): number {
    return deleteManyEntries(this.storage, keys, (k) => this.emitInvalidation(k));
  }

  /** Emits invalidation broadcast and fires key subscriber listeners. */
  protected emitInvalidation(key: string): void {
    this.crossTab.broadcastInvalidate(key);
    if (this.events.hasKeySubscribers(key)) this.events.notify(key, undefined);
  }

  /**
   * Returns a snapshot of cache telemetry performance (hits, misses, evictions).
   */
  public stats(): CacheStats {
    return this.statsTracker.getStats(this.storage.size);
  }

  /** Current count of active entries in storage. */
  public get size(): number {
    return this.storage.size;
  }

  /**
   * Destroys background timers, sync channels, listeners, and clears storage.
   */
  public destroy(): void {
    this.timers.destroy();
    this.crossTab.destroy();
    this.events.clear();
    this.clear();
  }

  /** Standard disposal alias for `destroy()`. */
  public dispose(): void {
    this.destroy();
  }

  /** Explicit resource management symbol `[Symbol.dispose]` support. */
  public [DISPOSE_SYMBOL](): void {
    this.destroy();
  }
}

