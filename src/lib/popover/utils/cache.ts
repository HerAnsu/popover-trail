import type { PopoverCache } from '../types';

function hasUnrefMethod(timer: unknown): timer is { unref: () => void } {
  return (
    typeof timer === 'object' &&
    timer !== null &&
    'unref' in timer &&
    typeof (timer as Record<string, unknown>).unref === 'function'
  );
}

/**
 * Strongly typed cache interface mapping popover keys to their exact resolved data payload types.
 * Eliminates the need for manual type assertions (`as TData`) when retrieving cached entries.
 *
 * @template TCacheMap - Record mapping popover key strings to their resolved data types.
 */
export interface TypedPopoverCache<TCacheMap extends Record<string, unknown>> {
  /** Retrieves a cached entry by key. */
  get<K extends Extract<keyof TCacheMap, string>>(key: K): TCacheMap[K] | undefined;
  /** Sets a cached payload for a key. */
  set<K extends Extract<keyof TCacheMap, string>>(key: K, data: TCacheMap[K]): void;
  /** Checks if key exists and is non-expired. */
  has<K extends Extract<keyof TCacheMap, string>>(key: K): boolean;
  /** Deletes an entry by key. */
  delete<K extends Extract<keyof TCacheMap, string>>(key: K): void;
  /** Clears all entries. */
  clear(): void;
}

/**
 * Standard in-memory caching engine for popover data payloads.
 * Supports Time-To-Live (TTL) record expiration, LRU eviction, and hit/miss auditing statistics.
 *
 * @remarks
 * Helps avoid duplicate network or asynchronous resolver calls when users re-hover or re-open cards.
 *
 * @example
 * ```typescript
 * const cache = new SimplePopoverCache<UserData>(5 * 60 * 1000, 100);
 * cache.set('user:123', { name: 'Alice' });
 *
 * const user = cache.get('user:123'); // returns { name: 'Alice' }
 * ```
 *
 * @template TData - The type of data stored inside the cache entries.
 */
export class SimplePopoverCache<TData = unknown> implements PopoverCache<TData> {
  private readonly cache = new Map<string, { data: TData; expiry: number }>();
  private readonly ttl: number;
  private readonly maxSize: number;
  private hitsCount = 0;
  private missesCount = 0;
  private autoPruneTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * Creates an instance of SimplePopoverCache.
   *
   * @param ttlMs - Time-to-live duration in milliseconds (default: 5 minutes / 300000ms).
   * @param maxSize - Maximum number of entries before FIFO eviction (default: 500).
   * @param autoPruneIntervalMs - Optional background auto-prune interval in ms (default: 0 / disabled).
   */
  constructor(ttlMs = 5 * 60 * 1000, maxSize = 500, autoPruneIntervalMs = 0) {
    this.ttl = ttlMs;
    this.maxSize = maxSize;

    if (autoPruneIntervalMs > 0 && typeof setInterval !== 'undefined') {
      this.autoPruneTimer = setInterval(() => this.pruneExpired(), autoPruneIntervalMs);
      if (hasUnrefMethod(this.autoPruneTimer)) {
        this.autoPruneTimer.unref();
      }
    }
  }

  private isExpired(entry: { expiry: number }): boolean {
    return Date.now() > entry.expiry;
  }

  /**
   * Checks if a non-expired entry exists for the given key without retrieving it.
   *
   * @param key - The unique cache key.
   * @returns True if a valid (non-expired) entry exists.
   */
  has(key: string): boolean {
    if (!key) return false;
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Retrieves a cached entry if it exists and has not expired yet.
   *
   * @param key - The unique cache key.
   * @returns The cached data payload if valid; otherwise `undefined`.
   */
  get(key: string): TData | undefined {
    if (!key) return undefined;
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      if (entry) this.cache.delete(key);
      this.missesCount++;
      return undefined;
    }

    this.hitsCount++;
    if (this.cache.size >= this.maxSize * 0.9) {
      this.cache.delete(key);
      this.cache.set(key, entry);
    }
    return entry.data;
  }

  /**
   * Saves data in the cache, stamping it with the configured TTL expiration threshold.
   * If the cache exceeds `maxSize`, the oldest entry is evicted (FIFO/LRU).
   *
   * @param key - The unique cache key.
   * @param data - The data payload to cache.
   */
  set(key: string, data: TData): void {
    if (!key) return;
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl,
    });
  }

  /**
   * Removes a specific item from the cache immediately.
   *
   * @param key - The unique cache key to delete.
   */
  delete(key: string): void {
    if (!key) return;
    this.cache.delete(key);
  }

  /**
   * Proactively sweeps and purges all expired entries from the cache map.
   */
  pruneExpired(): void {
    if (this.cache.size === 0) return;
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Returns hit/miss performance statistics for cache auditing.
   */
  stats(): { size: number; hits: number; misses: number; hitRatio: number } {
    const total = this.hitsCount + this.missesCount;
    return {
      size: this.cache.size,
      hits: this.hitsCount,
      misses: this.missesCount,
      hitRatio: total > 0 ? this.hitsCount / total : 0,
    };
  }

  /**
   * Stops background auto-prune interval timer and resets statistics.
   */
  destroy(): void {
    if (this.autoPruneTimer) {
      clearInterval(this.autoPruneTimer);
      this.autoPruneTimer = null;
    }
    this.clear();
  }

  /**
   * Disposable resource cleanup handle for TS 5.2+ explicit resource management.
   */
  dispose(): void {
    this.destroy();
  }

  /**
   * Returns the current number of active cached items.
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Clears all cached entries completely, resetting the internal store.
   */
  clear(): void {
    this.cache.clear();
    this.hitsCount = 0;
    this.missesCount = 0;
  }
}
