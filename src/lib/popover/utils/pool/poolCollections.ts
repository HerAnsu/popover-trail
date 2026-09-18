/**
 * Specialized Built-In Pools for Reusable Collections and Arrays.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolCollections
 */

import { ObjectPool } from './objectPoolCore';
import { globalPoolRegistry } from './poolRegistry';
import { toPoolCapacity, toPoolSize } from './poolBranded';

/**
 * Creates an object pool of reusable arrays, automatically cleared on release.
 *
 * @template T - Element type of the pooled arrays.
 * @param initial - Initial pre-allocated array count (default: 16).
 * @param max - Maximum array pool capacity (default: 128).
 * @returns An `ObjectPool<T[]>` instance.
 *
 * @example
 * ```typescript
 * const pool = createArrayPool<string>(8, 32);
 * const list = pool.acquire();
 * list.push('item-1', 'item-2');
 * pool.release(list); // automatically resets length to 0
 * ```
 */
export function createArrayPool<T = unknown>(initial = 16, max = 128): ObjectPool<T[]> {
  return new ObjectPool<T[]>({
    factory: () => [],
    reset: (arr) => {
      arr.length = 0;
    },
    initialCapacity: toPoolSize(initial),
    maxCapacity: toPoolCapacity(max),
  });
}

/**
 * Creates an object pool of reusable `Map<K, V>` instances, automatically cleared on release.
 *
 * @template K - Map key type.
 * @template V - Map value type.
 * @param initial - Initial pre-allocated map count (default: 8).
 * @param max - Maximum map pool capacity (default: 64).
 * @returns An `ObjectPool<Map<K, V>>` instance.
 *
 * @example
 * ```typescript
 * const pool = createMapPool<string, number>(4, 16);
 * const map = pool.acquire();
 * map.set('count', 42);
 * pool.release(map); // automatically clears the map
 * ```
 */
export function createMapPool<K = string, V = unknown>(
  initial = 8,
  max = 64,
): ObjectPool<Map<K, V>> {
  return new ObjectPool<Map<K, V>>({
    factory: () => new Map<K, V>(),
    reset: (map) => {
      map.clear();
    },
    initialCapacity: toPoolSize(initial),
    maxCapacity: toPoolCapacity(max),
  });
}

/**
 * Pre-allocated singleton array pool for transient batch operations and traversal passes.
 */
export const sharedArrayPool = createArrayPool<unknown>(32, 256);

/**
 * Pre-allocated singleton Map pool for transient index mappings and lookups.
 */
export const sharedMapPool = createMapPool<string, unknown>(8, 64);

globalPoolRegistry.register('collection-array', sharedArrayPool);
globalPoolRegistry.register('collection-map', sharedMapPool);
