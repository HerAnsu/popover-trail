import type { PopoverCache } from "../types";

/**
 * A standard, generic in-memory cache implementation of PopoverCache
 * supporting time-to-live (TTL) auto-eviction.
 */
export class SimplePopoverCache<TData = any> implements PopoverCache<TData> {
  private cache = new Map<string, { data: TData; expiry: number }>();
  private ttl: number;

  /**
   * @param ttlMs Time-to-live duration in milliseconds (default: 5 minutes).
   */
  constructor(ttlMs = 5 * 60 * 1000) {
    this.ttl = ttlMs;
  }

  /**
   * Retrieves a cached entry if it exists and has not expired yet.
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
   * Saves data in the cache with the configured TTL expiration.
   */
  set(key: string, data: TData): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl,
    });
  }

  /**
   * Removes a specific item from the cache.
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clears the cache completely.
   */
  clear(): void {
    this.cache.clear();
  }
}
