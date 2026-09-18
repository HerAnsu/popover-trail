/**
 * Extended popover cache featuring stale-while-revalidate (SWR), background polling,
 * optimistic mutations, and scoped namespace isolation.
 *
 * @module cache/SimplePopoverCache
 */

import type {
  CacheEntry,
  CacheEventMap,
  CacheEventType,
  CacheOptions,
  SWRFetchOptions,
} from './cacheTypes';
import { InvalidatablePopoverCache } from './invalidatablePopoverCache';
import { CacheSWRRunner } from './cacheSWRRunner';
import { CacheSWRController } from './cacheSWRController';
import { exportCacheSnapshot, restoreCacheSnapshot } from './cacheSnapshot';
import { DEFAULT_CACHE_MAX_SIZE, DEFAULT_CACHE_TTL_MS } from './cacheConfigParser';
import { createScopedCache, type ScopedPopoverCache } from './cacheNamespace';

/**
 * Extended popover cache featuring stale-while-revalidate (SWR), background polling,
 * optimistic mutations, and scoped namespace isolation.
 *
 * @template TData - Type of data payload stored in the cache.
 *
 * @example
 * ```typescript
 * const cache = new SimplePopoverCache<UserProfile>({ ttl: 30000 });
 *
 * // Fetches from API or serves fresh cache / SWR revalidation
 * const profile = await cache.getOrSet('user:42', async () => {
 *   return await fetchUserProfile(42);
 * });
 * ```
 */
export class SimplePopoverCache<TData = unknown> extends InvalidatablePopoverCache<TData> {

  private readonly swr: CacheSWRController<TData>;

  constructor(
    ttlOrOpts: number | CacheOptions<TData> = DEFAULT_CACHE_TTL_MS,
    maxSize = DEFAULT_CACHE_MAX_SIZE,
    autoPruneMs = 0,
  ) {
    super(ttlOrOpts, maxSize);
    const opts = typeof ttlOrOpts === 'object' && ttlOrOpts !== null ? ttlOrOpts : undefined;
    const pruneMs = opts?.autoPruneIntervalMs ?? autoPruneMs;
    this.timers.startPruneTimer(pruneMs, () => this.pruneExpired());
    this.swr = new CacheSWRController<TData>(this, new CacheSWRRunner<TData>(), this.events);
  }

  /**
   * Checks if a cached key has passed its time-to-live (TTL) or stale-while-revalidate threshold.
   *
   * @param key - Cache entry key to check.
   * @returns `true` if missing or expired, `false` if fresh.
   *
   * @example
   * ```typescript
   * if (cache.isStale('user:42')) {
   *   console.log('Cache entry needs background refresh');
   * }
   * ```
   */
  public isStale(key: string): boolean {
    const entry = this.storage.get(key);
    if (!entry) return true;
    const now = Date.now();
    return now > entry.expiry || (entry.staleAt !== undefined && now > entry.staleAt);
  }

  /**
   * Retrieves an item from cache, or fetches and stores it if missing or stale.
   * Supports in-flight request deduplication and SWR background revalidation.
   *
   * @param key - Cache key identifier.
   * @param fetcher - Async loader function returning the data.
   * @param opts - SWR fetch options (deduplication, timeout, stale-while-revalidate).
   * @returns Promise resolving to the retrieved or freshly fetched data.
   *
   * @example
   * ```typescript
   * const data = await cache.getOrSet('menu:items', () => api.fetchMenuItems());
   * ```
   */
  public getOrSet(
    key: string,
    fetcher: () => Promise<TData>,
    opts?: SWRFetchOptions,
  ): Promise<TData> {
    return this.swr.execute(key, fetcher, opts);
  }


  /**
   * Optimistically updates a cached value and notifies key subscribers.
   *
   * @param key - Cache key to update.
   * @param updater - New value or update function receiving the previous value.
   * @returns The updated value.
   *
   * @example
   * ```typescript
   * cache.mutate('user:42', (prev) => ({ ...prev, name: 'Bob' }));
   * ```
   */
  public mutate(key: string, updater: TData | ((prev: TData | undefined) => TData)): TData {
    return this.swr.mutate(key, updater);
  }

  /**
   * Forces revalidation of a key in the background, updating the cache upon resolution.
   *
   * @param key - Cache key to refresh.
   * @param fetcher - Async loader function.
   * @param opts - SWR options.
   * @returns Promise resolving to the freshly revalidated data.
   *
   * @example
   * ```typescript
   * await cache.revalidate('user:42', () => api.fetchUser(42));
   * ```
   */
  public revalidate(
    key: string,
    fetcher: () => Promise<TData>,
    opts?: SWRFetchOptions,
  ): Promise<TData> {
    return this.swr.revalidate(key, fetcher, opts);
  }

  /**
   * Periodically polls a remote data source at fixed intervals and updates the cache.
   *
   * @param key - Cache key.
   * @param intervalMs - Polling interval in milliseconds.
   * @param fetcher - Async loader function.
   * @returns Cleanup function to stop polling.
   *
   * @example
   * ```typescript
   * const stopPolling = cache.poll('status', 5000, () => api.checkStatus());
   * // Later:
   * stopPolling();
   * ```
   */
  public poll(key: string, intervalMs: number, fetcher: () => Promise<TData>): () => void {
    return this.timers.registerPolling(key, intervalMs, () => {
      void this.swr.revalidate(key, fetcher);
    });
  }

  /**
   * Creates a namespaced sub-cache instance where all keys are prefixed automatically.
   *
   * @param namespace - Prefix namespace string.
   * @returns Scoped cache wrapper.
   *
   * @example
   * ```typescript
   * const sessionCache = cache.scope('session:');
   * sessionCache.set('token', 'xyz'); // Stored as 'session:token' in root cache
   * ```
   */
  public scope(namespace: string): ScopedPopoverCache<TData> {
    return createScopedCache(this, namespace);
  }

  /**
   * Clears all cached items and resets storage metrics.
   */
  public override clear(): void {
    super.clear();
  }

  /**
   * Serializes all cached entries into an exportable array for persistence or debugging.
   *
   * @returns Array of key-entry tuples.
   *
   * @example
   * ```typescript
   * const snapshot = cache.dump();
   * localStorage.setItem('cache-backup', JSON.stringify(snapshot));
   * ```
   */
  public dump(): Array<[string, CacheEntry<TData>]> {
    return exportCacheSnapshot(this.storage);
  }

  /**
   * Restores cached entries from a previously exported snapshot.
   *
   * @param snapshot - Iterable collection of key-entry tuples.
   * @returns Number of successfully restored entries.
   *
   * @example
   * ```typescript
   * const saved = JSON.parse(localStorage.getItem('cache-backup') ?? '[]');
   * const count = cache.restore(saved);
   * ```
   */
  public restore(snapshot: Iterable<unknown>): number {
    return restoreCacheSnapshot(this.storage, snapshot, this.maxSize, this.events);
  }

  /**
   * Subscribes a listener callback to changes for a specific cache key.
   *
   * @param key - Key to monitor.
   * @param listener - Callback receiving the new value or undefined if evicted.
   * @returns Unsubscribe function.
   *
   * @example
   * ```typescript
   * const unsubscribe = cache.subscribe('user:42', (val) => {
   *   console.log('User changed:', val);
   * });
   * ```
   */
  public subscribe(key: string, listener: (value: TData | undefined) => void): () => void {
    return this.events.subscribe(key, listener);
  }

  /**
   * Subscribes a listener to global cache lifecycle events (hit, miss, evict, set, etc.).
   *
   * @param event - Lifecycle event name.
   * @param listener - Event handler.
   * @returns Unsubscribe function.
   *
   * @example
   * ```typescript
   * const unsubscribe = cache.on('evict', ({ key }) => {
   *   console.log('Evicted key:', key);
   * });
   * ```
   */
  public on<E extends CacheEventType>(
    event: E,
    listener: (payload: CacheEventMap<TData>[E]) => void,
  ): () => void {
    return this.events.on(event, listener);
  }
}
