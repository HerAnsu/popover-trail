/**
 * Lightweight O(1) LRU (Least Recently Used) Cache for popover-trail.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/lruCache
 */

export interface LRUCache<K, V> {
  get: (key: K) => V | undefined;
  set: (key: K, value: V) => void;
  has: (key: K) => boolean;
  delete: (key: K) => boolean;
  clear: () => void;
  readonly size: number;
}

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
