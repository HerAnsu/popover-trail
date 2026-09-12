/**
 * Extended popover cache with SWR, background polling, and event reactivity.
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

  public isStale(key: string): boolean {
    const entry = this.storage.get(key);
    if (!entry) return true;
    const now = Date.now();
    return now > entry.expiry || (entry.staleAt !== undefined && now > entry.staleAt);
  }

  public getOrSet(
    key: string,
    fetcher: () => Promise<TData>,
    opts?: SWRFetchOptions,
  ): Promise<TData> {
    return this.swr.execute(key, fetcher, opts);
  }

  public mutate(key: string, updater: TData | ((prev: TData | undefined) => TData)): TData {
    return this.swr.mutate(key, updater);
  }

  public revalidate(
    key: string,
    fetcher: () => Promise<TData>,
    opts?: SWRFetchOptions,
  ): Promise<TData> {
    return this.swr.revalidate(key, fetcher, opts);
  }

  public poll(key: string, intervalMs: number, fetcher: () => Promise<TData>): () => void {
    return this.timers.registerPolling(key, intervalMs, () => {
      void this.swr.revalidate(key, fetcher);
    });
  }

  public scope(namespace: string): ScopedPopoverCache<TData> {
    return createScopedCache(this, namespace);
  }

  public override clear(): void { super.clear(); }
  public dump(): Array<[string, CacheEntry<TData>]> { return exportCacheSnapshot(this.storage); }
  public restore(snapshot: Iterable<unknown>): number { return restoreCacheSnapshot(this.storage, snapshot, this.maxSize, this.events); }
  public subscribe(key: string, listener: (value: TData | undefined) => void): () => void { return this.events.subscribe(key, listener); }
  public on<E extends CacheEventType>(event: E, listener: (payload: CacheEventMap<TData>[E]) => void): () => void {
    return this.events.on(event, listener);
  }
}
