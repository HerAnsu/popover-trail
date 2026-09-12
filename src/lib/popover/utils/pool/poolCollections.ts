/**
 * Specialized Built-In Pools for Reusable Collections and Arrays.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolCollections
 */

import { ObjectPool } from './objectPoolCore';
import { globalPoolRegistry } from './poolRegistry';
import { toPoolCapacity, toPoolSize } from './poolBranded';

export function createArrayPool<T = unknown>(
  initial = 16,
  max = 128,
): ObjectPool<T[]> {
  return new ObjectPool<T[]>({
    factory: () => [],
    reset: (arr) => {
      arr.length = 0;
    },
    initialCapacity: toPoolSize(initial),
    maxCapacity: toPoolCapacity(max),
  });
}

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

export const sharedArrayPool = createArrayPool<unknown>(32, 256);
export const sharedMapPool = createMapPool<string, unknown>(8, 64);

globalPoolRegistry.register('collection-array', sharedArrayPool);
globalPoolRegistry.register('collection-map', sharedMapPool);
