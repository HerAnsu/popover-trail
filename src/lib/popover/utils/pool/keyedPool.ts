/**
 * Type-Safe Keyed Multi-Pool Partitioning & Bucket Allocation.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/keyedPool
 */

import { DISPOSE_SYMBOL } from '../disposable';
import type { ObjectPoolMetrics, ObjectPoolOptions } from './poolTypes';
import { ObjectPool } from './objectPoolCore';

export interface KeyedPoolOptions<K, T> {
  factory: (key: K) => T;
  poolOptions?: ObjectPoolOptions<T> | ((key: K) => ObjectPoolOptions<T>);
}

export class KeyedPool<K, T> {
  private readonly pools = new Map<K, ObjectPool<T>>();
  private readonly factory: (key: K) => T;
  private readonly optionsProvider?: ObjectPoolOptions<T> | ((key: K) => ObjectPoolOptions<T>);

  constructor(
    factoryOrOptions: ((key: K) => T) | KeyedPoolOptions<K, T>,
    optionsProvider?: ObjectPoolOptions<T> | ((key: K) => ObjectPoolOptions<T>),
  ) {
    const isFn = typeof factoryOrOptions === 'function';
    this.factory = isFn ? factoryOrOptions : factoryOrOptions.factory;
    this.optionsProvider = isFn ? optionsProvider : factoryOrOptions.poolOptions;
  }

  getPool(key: K): ObjectPool<T> {
    let pool = this.pools.get(key);
    if (!pool) {
      const opts =
        typeof this.optionsProvider === 'function'
          ? this.optionsProvider(key)
          : (this.optionsProvider ?? { factory: () => this.factory(key) });
      pool = new ObjectPool<T>({ ...opts, factory: () => this.factory(key) });
      this.pools.set(key, pool);
    }
    return pool;
  }

  acquire(key: K): T {
    return this.getPool(key).acquire();
  }
  release(key: K, item?: T | null): void {
    this.pools.get(key)?.release(item);
  }
  runWith<R>(key: K, fn: (item: T) => R): R {
    return this.getPool(key).runWith(fn);
  }
  use<R>(key: K, fn: (item: T) => R): R {
    return this.runWith(key, fn);
  }
  hasPool(key: K): boolean {
    return this.pools.has(key);
  }
  get partitionCount(): number {
    return this.pools.size;
  }
  getMetrics(key: K): ObjectPoolMetrics | undefined {
    return this.pools.get(key)?.getMetrics();
  }
  getAllMetrics(): Map<K, ObjectPoolMetrics> {
    const res = new Map<K, ObjectPoolMetrics>();
    for (const [k, pool] of this.pools) res.set(k, pool.getMetrics());
    return res;
  }

  drain(key: K, keep = 0): void {
    this.pools.get(key)?.drain(keep);
  }
  drainAll(keep = 0): void {
    for (const pool of this.pools.values()) pool.drain(keep);
  }
  clearAll(): void {
    for (const pool of this.pools.values()) pool.clear();
  }
  dispose(): void {
    for (const pool of this.pools.values()) pool.dispose();
    this.pools.clear();
  }
  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}

export function findNextBucket(buckets: readonly number[], minSize: number): number {
  for (const b of buckets) {
    if (b >= minSize) return b;
  }
  return buckets.at(-1) ?? minSize;
}

export function createBucketPool<T>(
  buckets: readonly number[],
  factory: (bucketSize: number) => T,
  reset?: (item: T) => void,
): KeyedPool<number, T> & { acquireBucket(minSize: number): T } {
  const sorted = [...buckets].sort((a, b) => a - b);
  const pool = new KeyedPool<number, T>((size) => factory(size), {
    factory: () => factory(0),
    reset,
  });
  return Object.assign(pool, {
    acquireBucket(minSize: number): T {
      const bucket = findNextBucket(sorted, minSize);
      return pool.acquire(bucket);
    },
  });
}
