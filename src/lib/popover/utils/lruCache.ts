/**
 * Lightweight O(1) LRU (Least Recently Used) Cache for popover-trail.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/lruCache
 */

/**
 * Lightweight in-memory LRU (Least Recently Used) Cache contract.
 * Guarantees amortized O(1) get, set, has, delete operations via ES6 Map ordering semantics.
 *
 * @template K - Cache key type.
 * @template V - Cached value type.
 */
export interface LRUCache<K, V> {
  /**
   * Retrieves a value by key and refreshes its recency to the most recently used position.
   *
   * @param key - Cache key.
   * @returns Cached value or `undefined` if absent.
   */
  get: (key: K) => V | undefined;

  /**
   * Stores a value by key, promoting it to most recently used position.
   * If cache exceeds `maxSize`, evicts the least recently accessed entry.
   *
   * @param key - Cache key.
   * @param value - Value to cache.
   */
  set: (key: K, value: V) => void;

  /**
   * Checks whether a key exists in the cache without altering its LRU recency.
   *
   * @param key - Cache key.
   * @returns True if entry exists.
   */
  has: (key: K) => boolean;

  /**
   * Deletes a cached entry by key.
   *
   * @param key - Cache key.
   * @returns True if entry existed and was removed.
   */
  delete: (key: K) => boolean;

  /** Clears all cached entries. */
  clear: () => void;

  /** Current number of cached entries. */
  readonly size: number;
}

/**
 * Creates a bounded O(1) LRU (Least Recently Used) cache backed by JavaScript Map key insertion order.
 *
 * @template K - Cache key type.
 * @template V - Cached value type.
 * @param maxSize - Maximum number of entries before eviction (defaults to 50).
 * @returns An initialized `LRUCache` instance.
 *
 * @example
 * ```typescript
 * const cache = createLRUCache<string, HTMLElement>(10);
 * cache.set('header', headerEl);
 * const el = cache.get('header');
 * ```
 */
export function createLRUCache<K, V>(maxSize = 50): LRUCache<K, V> {
  const limit = Math.max(1, maxSize);
  const cache = new Map<K, V>();

  return {
    get: (key: K): V | undefined => {
      const val = cache.get(key);
      if (val === undefined) return undefined;
      cache.delete(key);
      cache.set(key, val);
      return val;
    },

    set: (key: K, value: V): void => {
      if (cache.has(key)) {
        cache.delete(key);
      } else if (cache.size >= limit) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey !== undefined) cache.delete(oldestKey);
      }
      cache.set(key, value);
    },

    has: (key: K): boolean => cache.has(key),

    delete: (key: K): boolean => cache.delete(key),

    clear: (): void => {
      cache.clear();
    },

    get size(): number {
      return cache.size;
    },
  };
}
