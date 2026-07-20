import type { PopoverCache } from '../types';

/**
 * A standard, generic in-memory cache implementation of PopoverCache
 * supporting automatic time-to-live (TTL) record expiration, maximum size
 * eviction, and lazy cleanup.
 *
 * @template TData - The type of data stored inside the cache entries.
 *
 * @remarks
 * Expiration checks are lazy; expired items are automatically evicted
 * and deleted from the internal Map upon calling {@link get}.
 * When the cache exceeds {@link maxSize}, the oldest entry is evicted
 * on insertion (FIFO eviction policy).
 *
 * @example
 * ```typescript
 * const cache = new SimplePopoverCache<MathData>(10 * 1000, 100); // 10s TTL, max 100 entries
 * cache.set("5 + 5", { value: 10 });
 * console.log(cache.get("5 + 5")); // returns { value: 10 }
 * ```
 */
export class SimplePopoverCache<TData = unknown> implements PopoverCache<TData> {
  private readonly cache = new Map<string, { data: TData; expiry: number }>();
  private readonly ttl: number;
  private readonly maxSize: number;

  /**
   * Creates an instance of SimplePopoverCache.
   *
   * @param ttlMs - Time-to-live duration in milliseconds (default: 5 minutes / 300000ms).
   * @param maxSize - Maximum number of entries before FIFO eviction (default: 500).
   */
  constructor(ttlMs = 5 * 60 * 1000, maxSize = 500) {
    this.ttl = ttlMs;
    this.maxSize = maxSize;
  }

  /**
   * Checks if a non-expired entry exists for the given key without retrieving it.
   *
   * @param key - The unique cache key.
   * @returns True if a valid (non-expired) entry exists.
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
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
   * If the cache exceeds `maxSize`, the oldest entry is evicted (FIFO).
   *
   * @param key - The unique cache key.
   * @param data - The data payload to cache.
   */
  set(key: string, data: TData): void {
    // Evict oldest entry if at capacity (and not updating an existing key)
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
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
    this.cache.delete(key);
  }

  /**
   * Clears all cached entries completely, resetting the internal store.
   */
  clear(): void {
    this.cache.clear();
  }
}
