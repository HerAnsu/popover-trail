/**
 * Type definitions, interfaces, and contracts for the modular caching engine.
 *
 * @module cache/cacheTypes
 */

/**
 * Runtime metrics and hit/miss statistics for cache efficiency monitoring.
 */
export interface CacheStats {
  /** Total number of items currently held in cache storage. */
  readonly size: number;
  /** Cumulative count of successful cache lookups. */
  readonly hits: number;
  /** Cumulative count of failed lookups (non-existent or expired). */
  readonly misses: number;
  /**
   * Hit efficiency ratio in the range [0.0, 1.0].
   * Calculated as `hits / (hits + misses)`. Returns 0 if total requests is 0.
   */
  readonly hitRatio: number;
}

/**
 * Internal storage representation for a cached item with temporal and memory bounds.
 *
 * @template T - The payload data type stored in this cache entry.
 */
export interface CacheEntry<T = unknown> {
  /** Cached payload data. */
  readonly data: T;
  /** Unix epoch timestamp (milliseconds) at which this entry hard-expires and must be evicted. */
  readonly expiry: number;
  /** Optional Unix epoch timestamp (milliseconds) after which this entry is considered stale for SWR. */
  readonly staleAt?: number;
  /** Associated taxonomy tags for bulk invalidation (e.g. `['user', 'session']`). */
  readonly tags?: readonly string[];
  /** Estimated memory weight in bytes for capacity budgeting. */
  readonly weight?: number;
  /** Unix epoch timestamp (milliseconds) when the entry was created. */
  readonly createdAt?: number;
}

/**
 * Configuration options for caching individual keys via `cache.set()`.
 */
export interface CacheSetOptions {
  /** Time-to-live in milliseconds before hard expiry. */
  readonly ttlMs?: number;
  /** Duration in milliseconds before entry becomes stale for SWR background revalidation. */
  readonly staleMs?: number;
  /** Invalidation tags attached to this entry. */
  readonly tags?: readonly string[];
  /** Explicit byte weight override for memory-budgeted caches. */
  readonly weight?: number;
  /** When true, automatically computes the approximate byte size of the payload. */
  readonly autoEstimateWeight?: boolean;
}

/**
 * Configuration parameters for initializing a Cache engine instance.
 *
 * @template T - Default payload data type.
 */
export interface CacheOptions<T = unknown> {
  /** Default time-to-live in milliseconds for entries written without explicit TTL. Default is 5 minutes. */
  readonly ttlMs?: number;
  /** Maximum number of entries permitted before LRU eviction triggers. Default is 100. */
  readonly maxSize?: number;
  /** Maximum total byte weight permitted before weight-based eviction triggers. */
  readonly maxWeight?: number;
  /** Periodic background interval in milliseconds to sweep expired entries. Default is 60_000 (1 min). */
  readonly autoPruneIntervalMs?: number;
  /** When true, automatically calculates byte weights for memory budgeting. Default is false. */
  readonly autoEstimateWeight?: boolean;
  /** Custom storage backend adapter conforming to the StorageAdapter contract. Default is memory Map. */
  readonly storage?: StorageAdapter<T>;
  /** BroadcastChannel identifier for multi-tab cache invalidation synchronization. */
  readonly channelName?: string;
}

/**
 * Stale-While-Revalidate execution options for cached fetch operations.
 */
export interface SWRFetchOptions {
  /** Hard TTL in milliseconds before the cache entry must be evicted. */
  readonly ttlMs?: number;
  /** Soft TTL in milliseconds after which stale cached data is returned while revalidating. */
  readonly staleMs?: number;
  /** Taxonomic tags for group invalidation. */
  readonly tags?: readonly string[];
  /** Byte weight override. */
  readonly weight?: number;
  /** Maximum retry attempts for failed revalidation requests. Default is 0. */
  readonly retries?: number;
  /** Delay in milliseconds between retry attempts. Default is 250ms. */
  readonly retryDelayMs?: number;
}

/**
 * Supported lifecycle event keys emitted by the cache engine.
 */
export type CacheEventType = 'hit' | 'miss' | 'stale' | 'revalidate' | 'error' | 'evict';

/**
 * Event payload schemas emitted on cache lifecycle occurrences.
 *
 * @template T - The payload type associated with the event.
 */
export interface CacheEventMap<T = unknown> {
  readonly hit: { readonly key: string; readonly value: T };
  readonly miss: { readonly key: string };
  readonly stale: { readonly key: string; readonly value: T };
  readonly revalidate: { readonly key: string; readonly value: T };
  readonly error: { readonly key: string; readonly error: unknown };
  readonly evict: { readonly key: string; readonly reason: 'lru' | 'expired' | 'weight' };
}

/**
 * Current validity status of a cache entry.
 *
 * Status values:
 * - `fresh`: Within freshness window. Safe to use immediately.
 * - `stale`: Past freshness window, but before hard expiry. Good for stale-while-revalidate display.
 * - `expired`: Past expiration time. Needs a fresh fetch or removal.
 *
 * @remarks
 * Discriminating on the `status` tag enables complete compile-time type narrowing:
 * ```ts
 * const state = getCacheEntryState(entry);
 * switch (state.status) {
 *   case 'fresh':
 *     return render(state.data);
 *   case 'stale':
 *     triggerBackgroundRevalidate(key);
 *     return render(state.data);
 *   case 'expired':
 *     return fetchAndRender(key);
 * }
 * ```
 *
 * @template T - The payload data type stored in this cache entry.
 */
export type CacheEntryState<T = unknown> =
  | {
      readonly status: 'fresh';
      readonly data: T;
      readonly expiry: number;
      readonly tags?: readonly string[];
    }
  | {
      readonly status: 'stale';
      readonly data: T;
      readonly staleAt: number;
      readonly tags?: readonly string[];
    }
  | {
      readonly status: 'expired';
      readonly data: T;
      readonly expiry: number;
      readonly tags?: readonly string[];
    };

/**
 * Strongly-typed event listener map for cache lifecycle events.
 *
 * @template T - The payload data type.
 */
export type CacheEventHandlerMap<T = unknown> = {
  readonly [K in CacheEventType]?: (event: CacheEventMap<T>[K]) => void;
};

/**
 * Storage adapter abstraction allowing custom storage backends (in-memory Map, localStorage, LRU).
 *
 * @template T - The payload data type.
 */
export interface StorageAdapter<T = unknown> {
  /** Retrieves a cache entry by key. Returns undefined if not found. */
  get(key: string): CacheEntry<T> | undefined;
  /** Inserts or updates a cache entry. */
  set(key: string, entry: CacheEntry<T>): void;
  /** Removes an entry by key. Returns true if removed, false otherwise. */
  delete(key: string): boolean;
  /** Purges all entries from storage. */
  clear(): void;
  /** Returns an iterable of all active cache keys. */
  keys(): Iterable<string>;
  /** Returns an iterable of all active key-entry pairs. */
  entries(): Iterable<[string, CacheEntry<T>]>;
  /** Total number of items currently stored. */
  readonly size: number;
}

/**
 * Type-safe cache facade mapping known string keys to their strictly typed payload values.
 *
 * @template TCacheMap - Dictionary record mapping string keys to their value types.
 */
export interface TypedPopoverCache<TCacheMap extends Record<string, unknown>> {
  /** Retrieves strongly typed data for a given key, or undefined if missing/expired. */
  get<K extends Extract<keyof TCacheMap, string>>(key: K): TCacheMap[K] | undefined;
  /** Sets a strongly typed value for a key with optional TTL and configuration. */
  set<K extends Extract<keyof TCacheMap, string>>(
    key: K,
    data: TCacheMap[K],
    ttlOrOpts?: number | CacheSetOptions,
  ): void;
  /** Checks whether a valid (unexpired) entry exists for the key. */
  has<K extends Extract<keyof TCacheMap, string>>(key: K): boolean;
  /** Deletes an entry by key. */
  delete<K extends Extract<keyof TCacheMap, string>>(key: K): boolean | void;
  /** Purges all cached entries. */
  clear(): void;
}
