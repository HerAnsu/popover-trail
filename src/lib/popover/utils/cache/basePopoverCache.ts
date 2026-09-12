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

export class BasePopoverCache<TData = unknown> implements PopoverCache<TData> {
  protected readonly storage: StorageAdapter<TData>;
  protected readonly ttl: number;
  protected readonly maxSize: number;
  protected readonly statsTracker = new CacheStatsTracker();
  protected readonly events = new CacheEventEmitter<TData>();
  protected readonly timers = new CacheTimerManager();
  protected readonly crossTab: CrossTabSync;

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

  public get(key: string): TData | undefined {
    return readCacheEntry(this.storage, this.statsTracker, this.events, key);
  }

  public set(key: string, data: TData, ttlOrOpts?: number | CacheSetOptions): void {
    writeCacheEntry(this.storage, this.maxSize, this.ttl, this.events, key, data, ttlOrOpts);
  }

  public has(key: string): boolean {
    return hasCacheEntry(this.storage, key);
  }

  public delete(key: string): boolean {
    if (!isValidStorageKey(key) || !this.storage.delete(key)) return false;
    this.emitInvalidation(key);
    return true;
  }

  public clear(): void {
    this.storage.clear();
    this.statsTracker.reset();
  }

  public getMany(keys: readonly string[]): Map<string, TData> {
    return getManyEntries(this.storage, this.statsTracker, this.events, keys);
  }

  public setMany(entries: readonly BatchSetTuple<TData>[]): void {
    setManyEntries(this.storage, this.maxSize, this.ttl, this.events, entries);
  }

  public deleteMany(keys: readonly string[]): number {
    return deleteManyEntries(this.storage, keys, (k) => this.emitInvalidation(k));
  }

  protected emitInvalidation(key: string): void {
    this.crossTab.broadcastInvalidate(key);
    if (this.events.hasKeySubscribers(key)) this.events.notify(key, undefined);
  }

  public stats(): CacheStats {
    return this.statsTracker.getStats(this.storage.size);
  }
  public get size(): number {
    return this.storage.size;
  }

  public destroy(): void {
    this.timers.destroy();
    this.crossTab.destroy();
    this.events.clear();
    this.clear();
  }

  public dispose(): void {
    this.destroy();
  }
  public [DISPOSE_SYMBOL](): void {
    this.destroy();
  }
}
