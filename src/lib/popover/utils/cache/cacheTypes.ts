/**
 * Type definitions, interfaces, and contracts for the modular caching engine.
 *
 * @module cache/cacheTypes
 */

export interface CacheStats {
  readonly size: number;
  readonly hits: number;
  readonly misses: number;
  readonly hitRatio: number;
}

export interface CacheEntry<T = unknown> {
  readonly data: T;
  readonly expiry: number;
  readonly staleAt?: number;
  readonly tags?: readonly string[];
  readonly weight?: number;
  readonly createdAt?: number;
}

export interface CacheSetOptions {
  readonly ttlMs?: number;
  readonly staleMs?: number;
  readonly tags?: readonly string[];
  readonly weight?: number;
  readonly autoEstimateWeight?: boolean;
}

export interface CacheOptions<T = unknown> {
  readonly ttlMs?: number;
  readonly maxSize?: number;
  readonly maxWeight?: number;
  readonly autoPruneIntervalMs?: number;
  readonly autoEstimateWeight?: boolean;
  readonly storage?: StorageAdapter<T>;
  readonly channelName?: string;
}

export interface SWRFetchOptions {
  readonly ttlMs?: number;
  readonly staleMs?: number;
  readonly tags?: readonly string[];
  readonly weight?: number;
  readonly retries?: number;
  readonly retryDelayMs?: number;
}

export type CacheEventType = 'hit' | 'miss' | 'stale' | 'revalidate' | 'error' | 'evict';

export interface CacheEventMap<T = unknown> {
  readonly hit: { readonly key: string; readonly value: T };
  readonly miss: { readonly key: string };
  readonly stale: { readonly key: string; readonly value: T };
  readonly revalidate: { readonly key: string; readonly value: T };
  readonly error: { readonly key: string; readonly error: unknown };
  readonly evict: { readonly key: string; readonly reason: 'lru' | 'expired' | 'weight' };
}

export interface StorageAdapter<T = unknown> {
  get(key: string): CacheEntry<T> | undefined;
  set(key: string, entry: CacheEntry<T>): void;
  delete(key: string): boolean;
  clear(): void;
  keys(): Iterable<string>;
  entries(): Iterable<[string, CacheEntry<T>]>;
  readonly size: number;
}

export interface TypedPopoverCache<TCacheMap extends Record<string, unknown>> {
  get<K extends Extract<keyof TCacheMap, string>>(key: K): TCacheMap[K] | undefined;
  set<K extends Extract<keyof TCacheMap, string>>(
    key: K,
    data: TCacheMap[K],
    ttlOrOpts?: number | CacheSetOptions,
  ): void;
  has<K extends Extract<keyof TCacheMap, string>>(key: K): boolean;
  delete<K extends Extract<keyof TCacheMap, string>>(key: K): boolean | void;
  clear(): void;
}
