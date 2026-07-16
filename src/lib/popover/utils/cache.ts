import type { PopoverCache } from '../types';

/**
 * A standard, generic in-memory cache implementation of PopoverCache
 * supporting automatic time-to-live (TTL) record expiration and eviction.
 *
 * @template TData - The type of data stored inside the cache entries.
 *
 * @remarks
 * Expiration checks are lazy; expired items are automatically evicted
 * and deleted from the internal Map upon calling {@link get}.
 *
 * @example
 * ```typescript
 * const cache = new SimplePopoverCache<MathData>(10 * 1000); // 10 second TTL
 * cache.set("5 + 5", { value: 10 });
 * console.log(cache.get("5 + 5")); // returns { value: 10 }
 * ```
 */
export class SimplePopoverCache<TData = unknown> implements PopoverCache<TData> {
  private cache = new Map<string, { data: TData; expiry: number }>();
  private ttl: number;

  /**
   * Creates an instance of SimplePopoverCache.
   *
   * @param ttlMs - Time-to-live duration in milliseconds (default: 5 minutes / 300000ms).
   */
  constructor(ttlMs = 5 * 60 * 1000) {
    this.ttl = ttlMs;
  }

  /**
   * Retrieves a cached entry if it exists and has not expired yet.
   *
   * @remarks
   * If the item is found but its expiration timestamp has passed,
   * it will be deleted from the cache map and `undefined` will be returned.
   *
   * @param key - The unique cache key.
   * @returns The cached data payload if valid; otherwise `undefined`.
   */
  get(key: string): TData | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  /**
   * Saves data in the cache, stamping it with the configured TTL expiration threshold.
   *
   * @param key - The unique cache key.
   * @param data - The data payload to cache.
   */
  set(key: string, data: TData): void {
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
    this.cache.delete(key);
  }

  /**
   * Clears all cached entries completely, resetting the internal store.
   */
  clear(): void {
    this.cache.clear();
  }
}
