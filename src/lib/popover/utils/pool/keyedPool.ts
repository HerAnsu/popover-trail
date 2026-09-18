/**
 * Type-Safe Keyed Multi-Pool Partitioning & Bucket Allocation.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/keyedPool
 */

import { DISPOSE_SYMBOL } from '../disposable';
import type { ObjectPoolMetrics, ObjectPoolOptions, Pooled, PooledTuple, TupleOf } from './poolTypes';
import { ObjectPool } from './objectPoolCore';
import { last } from '../arrayUtils';
import { attachDisposableHandle } from './poolScope';

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

  /**
   * Retrieves or lazily instantiates the specialized `ObjectPool<T>` for the specified key.
   *
   * @param key - Partition identifier.
   * @returns The resolved pool instance.
   *
   * @example
   * ```typescript
   * const bufferPool = pool.getPool(1024);
   * ```
   */
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

  /**
   * Acquires a pooled instance from the partition pool mapped to `key`.
   *
   * @param key - Partition key.
   * @returns A borrowed or freshly instantiated item.
   *
   * @example
   * ```typescript
   * const buffer = pool.acquire(256);
   * ```
   */
  acquire(key: K): T {
    return this.getPool(key).acquire();
  }

  /**
   * Releases a borrowed instance back to the partition pool associated with `key`.
   *
   * @param key - Partition key.
   * @param item - Borrowed item to return.
   *
   * @example
   * ```typescript
   * pool.release(256, buffer);
   * ```
   */
  release(key: K, item?: T | null): void {
    this.pools.get(key)?.release(item);
  }

  /**
   * Borrows an item from the partition pool mapped to `key`, augmented with RAII disposal contracts.
   * Compatible with the native ECMAScript / TypeScript `using` keyword.
   *
   * @param key - Partition key.
   * @returns The pooled item wrapped with RAII disposal contracts.
   *
   * @example
   * ```typescript
   * {
   *   using buf = keyedPool.borrow('scratch');
   *   buf.fill(0);
   * } // automatically released back to partition 'scratch' at scope exit!
   * ```
   */
  borrow(key: K): Pooled<T> {
    const item = this.acquire(key);
    return attachDisposableHandle(item as object, () => this.release(key, item)) as Pooled<T>;
  }

  /**
   * Borrows multiple items from partition `key` as a strongly typed tuple augmented with RAII disposal.
   *
   * @template N - Number of items to borrow.
   * @param key - Partition key.
   * @param count - Count of items to borrow.
   * @returns Typed tuple array with RAII disposal contracts.
   */
  borrowMany<N extends number>(key: K, count: N): PooledTuple<T, N> {
    const safeCount = Math.max(1, count);
    const items: T[] = [];
    for (let i = 0; i < safeCount; i++) {
      items.push(this.acquire(key));
    }
    return attachDisposableHandle(items, () => {
      for (const item of items) {
        this.release(key, item);
      }
    }) as PooledTuple<T, N>;
  }

  /**
   * Pre-warms the partition pool associated with `key` up to `count` items.
   *
   * @param key - Partition key.
   * @param count - Desired target capacity to prewarm.
   * @returns `this` for fluent chaining.
   */
  prewarm(key: K, count: number): this {
    this.getPool(key).warmup(count);
    return this;
  }

  /**
   * Scoped execution helper: borrows an item from the partition pool, executes `fn`,
   * and automatically guarantees that the item is released upon return or error.
   *
   * @template R - Return value type.
   * @param key - Partition key.
   * @param fn - Work function receiving the borrowed item.
   * @returns The result produced by `fn`.
   *
   * @example
   * ```typescript
   * const size = pool.runWith('scratch', (arr) => arr.length);
   * ```
   */
  runWith<R>(key: K, fn: (item: T) => R): R {
    return this.getPool(key).runWith(fn);
  }

  /**
   * Scoped execution helper for partition `key`: borrows an item, executes `fn`,
   * and automatically guarantees that the item is released upon return or error.
   */
  use<R>(key: K, fn: (item: T) => R): R;
  /**
   * Scoped execution helper for `count` items from partition `key`, provided as a strongly typed tuple.
   */
  use<N extends number, R>(key: K, count: N, fn: (items: TupleOf<T, N>) => R): R;
  use<R>(
    key: K,
    first: ((item: T) => R) | number,
    second?: (items: never) => R,
  ): R {
    if (typeof first === 'function') {
      return this.runWith(key, first);
    }
    if (typeof second !== 'function') {
      throw new TypeError('Expected callback function');
    }
    const count = Math.max(1, first);
    const items: T[] = [];
    try {
      for (let i = 0; i < count; i++) {
        items.push(this.acquire(key));
      }
      return second(items as never);
    } finally {
      for (const item of items) {
        this.release(key, item);
      }
    }
  }

  /**
   * Checks whether a partition pool has been instantiated for the given key.
   *
   * @param key - Partition key.
   * @returns True if a pool exists for `key`.
   */
  hasPool(key: K): boolean {
    return this.pools.has(key);
  }

  /**
   * Number of active key partitions allocated.
   */
  get partitionCount(): number {
    return this.pools.size;
  }

  /**
   * Retrieves telemetry metrics for the pool corresponding to `key`.
   *
   * @param key - Partition key.
   * @returns Pool metrics or `undefined` if partition does not exist.
   */
  getMetrics(key: K): ObjectPoolMetrics | undefined {
    return this.pools.get(key)?.getMetrics();
  }

  /**
   * Retrieves telemetry metrics for all active partitions in the keyed pool.
   *
   * @returns Map of partition keys to pool metrics.
   */
  getAllMetrics(): Map<K, ObjectPoolMetrics> {
    const res = new Map<K, ObjectPoolMetrics>();
    for (const [k, pool] of this.pools) res.set(k, pool.getMetrics());
    return res;
  }

  /**
   * Evicts idle instances from the specified key partition pool down to `keep`.
   *
   * @param key - Partition key.
   * @param keep - Number of idle instances to preserve (default: 0).
   */
  drain(key: K, keep = 0): void {
    this.pools.get(key)?.drain(keep);
  }

  /**
   * Evicts idle instances across all key partition pools down to `keep`.
   *
   * @param keep - Number of idle instances to preserve per partition (default: 0).
   */
  drainAll(keep = 0): void {
    for (const pool of this.pools.values()) pool.drain(keep);
  }

  /**
   * Clears all idle instances across every key partition.
   */
  clearAll(): void {
    for (const pool of this.pools.values()) pool.clear();
  }

  /**
   * Disposes all partition pools and empties the registry.
   */
  dispose(): void {
    for (const pool of this.pools.values()) pool.dispose();
    this.pools.clear();
  }

  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}

/**
 * Finds the smallest bucket size in a sorted collection that is greater than or equal to `minSize`.
 * Falls back to the largest available bucket or `minSize` if all buckets are smaller.
 *
 * @param buckets - Ordered list of bucket sizes.
 * @param minSize - Required minimum size.
 * @returns The chosen bucket size.
 *
 * @example
 * ```typescript
 * const bucket = findNextBucket([64, 128, 256, 512], 100); // 128
 * ```
 */
export function findNextBucket(buckets: readonly number[], minSize: number): number {
  for (const b of buckets) {
    if (b >= minSize) return b;
  }
  return last(buckets) ?? minSize;
}

/**
 * Factory creating a size-bucketed object pool for variable-sized resources (e.g., buffers, typed arrays).
 *
 * @template T - Pooled item type.
 * @param buckets - List of supported bucket capacities.
 * @param factory - Factory creating an item of specified bucket size.
 * @param reset - Optional callback to reset item state upon return.
 * @returns Keyed pool extended with `acquireBucket(minSize)` method.
 *
 * @example
 * ```typescript
 * const typedArrayPool = createBucketPool(
 *   [16, 64, 256],
 *   (size) => new Float32Array(size),
 *   (arr) => arr.fill(0)
 * );
 * const buf = typedArrayPool.acquireBucket(50); // acquires from bucket 64
 * ```
 */
/**
 * Extended KeyedPool interface supporting size-bucketed allocation and RAII scopes.
 */
export interface BucketedPool<T extends object> extends KeyedPool<number, T> {
  acquireBucket(minSize: number): T;
  borrowBucket(minSize: number): Pooled<T>;
}

/**
 * Factory creating a size-bucketed object pool for variable-sized resources (e.g., buffers, typed arrays).
 *
 * @template T - Pooled item type.
 * @param buckets - List of supported bucket capacities.
 * @param factory - Factory creating an item of specified bucket size.
 * @param reset - Optional callback to reset item state upon return.
 * @returns Keyed pool extended with `acquireBucket(minSize)` and `borrowBucket(minSize)` methods.
 *
 * @example
 * ```typescript
 * const typedArrayPool = createBucketPool(
 *   [16, 64, 256],
 *   (size) => new Float32Array(size),
 *   (arr) => arr.fill(0)
 * );
 * const buf = typedArrayPool.acquireBucket(50); // acquires from bucket 64
 * ```
 */
export function createBucketPool<T extends object>(
  buckets: readonly number[],
  factory: (bucketSize: number) => T,
  reset?: (item: T) => void,
): BucketedPool<T> {
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
    borrowBucket(minSize: number): Pooled<T> {
      const bucket = findNextBucket(sorted, minSize);
      return pool.borrow(bucket);
    },
  });
}

