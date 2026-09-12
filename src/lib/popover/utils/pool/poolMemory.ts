/**
 * Memory Management, Compaction, and Warmup Algorithms for Object Pools.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolMemory
 */

import type { PoolStorage } from './poolStorage';
import { tryEvictItem } from './poolOperations';

export function shrinkPoolToFit<T>(
  storage: PoolStorage<T>,
  minCapacity = 0,
  onEvict?: (item: T) => void,
): number {
  const safeMin = Math.max(0, minCapacity);
  const evicted = storage.drain(safeMin);
  for (const item of evicted) {
    tryEvictItem(onEvict, item);
  }
  return evicted.length;
}

export function warmupPool<T>(
  storage: PoolStorage<T>,
  targetCount: number,
  factory: () => T,
): number {
  const needed = Math.max(0, targetCount - storage.size);
  if (needed <= 0) return 0;
  return storage.preallocate(needed, factory);
}
