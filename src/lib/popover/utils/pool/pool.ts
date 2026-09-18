/**
 * Unified High-Performance Object Pool with Modern RAII & Variadic Scopes.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/pool
 */

import { DISPOSE_SYMBOL, type ScopeDisposable } from '../resource/disposableTypes';
import type {
  ObjectPoolMetrics,
  Pooled,
  PooledTuple,
  PoolResetPolicy,
  TupleOf,
  UnifiedPoolOptions,
} from './poolTypes';
import { KeyedPool, type KeyedPoolOptions } from './keyedPool';
import type { PoolCapacity } from './poolBranded';
import { attachDisposableHandle } from './poolScope';
import { tryResetItem } from './poolOperations';
import { type PoolDriver, createPoolDriver } from './poolDriver';

export type { Pooled, PooledTuple, TupleOf, UnifiedPoolOptions, PoolResetPolicy };
export type { PoolDriver };

/**
 * Unified, ergonomic object pool for zero-allocation performance and modern DX.
 *
 * Provides effortless resource management:
 * 1. Native `using` keyword support via `pool.borrow()`.
 * 2. Variadic type-safe tuple scopes via `pool.use(2, ([a, b]) => ...)`.
 * 3. Unified static factories for dynamic, fixed-slab, and keyed pools.
 *
 * @template T - Pooled object type (must extend object).
 *
 * @example
 * ```typescript
 * import { Pool } from 'popover-trail/utils';
 *
 * const pointPool = Pool.create(() => ({ x: 0, y: 0 }));
 *
 * // Modern RAII scope with automatic cleanup
 * {
 *   using p1 = pointPool.borrow();
 *   using p2 = pointPool.borrow();
 *   p1.x = 10;
 *   p2.x = 50;
 * } // Both points are automatically returned to the pool!
 *
 * // Variadic tuple scope
 * pointPool.use(2, ([start, end]) => {
 *   start.x = 0;
 *   end.x = 100;
 * });
 * ```
 */
export class Pool<T extends object> implements ScopeDisposable {
  private readonly driver: PoolDriver<T>;
  private readonly activeHandles = new WeakSet<T>();
  private readonly resetCallback?: (item: T) => void;
  private readonly resetOnAcquire: boolean;

  /**
   * Creates a dynamic auto-scaling `Pool<T>`.
   *
   * @template T - Pooled object type.
   * @param factory - Resource instantiation factory.
   * @param options - Configuration options.
   * @returns Configured `Pool<T>` instance.
   */
  static create<T extends object>(
    factory: () => T,
    options?: UnifiedPoolOptions<T>,
  ): Pool<T> {
    return new Pool<T>(factory, options);
  }

  /**
   * Creates a strictly pre-allocated mono-slab `Pool<T>` for maximum hot-path throughput.
   *
   * @template T - Pooled object type.
   * @param factory - Resource instantiation factory.
   * @param capacity - Fixed slab capacity (default: 32).
   * @param reset - Optional callback to reset item state upon return.
   * @returns Configured fixed-slab `Pool<T>` instance.
   */
  static fixed<T extends object>(
    factory: () => T,
    capacity: number | PoolCapacity = 32,
    reset?: (item: T) => void,
  ): Pool<T> {
    return new Pool<T>(factory, { mode: 'fixed', initialCapacity: capacity, maxCapacity: capacity, reset });
  }

  /**
   * Creates a multi-partition keyed pool where items are pooled by category or size.
   *
   * @template K - Partition key type.
   * @template T - Pooled object type.
   * @param factory - Partitioned instantiation factory receiving key.
   * @param options - Keyed pool options.
   * @returns `KeyedPool<K, T>` instance.
   */
  static keyed<K, T extends object>(
    factory: (key: K) => T,
    options?: KeyedPoolOptions<K, T>,
  ): KeyedPool<K, T> {
    return new KeyedPool<K, T>(factory, options?.poolOptions);
  }

  constructor(
    factory: () => T,
    options: UnifiedPoolOptions<T> = {},
  ) {
    const resolved = createPoolDriver(factory, options);
    this.driver = resolved.driver;
    this.resetCallback = resolved.resetCallback;
    this.resetOnAcquire = resolved.resetOnAcquire;
  }

  /**
   * Borrows an item from the pool.
   *
   * @returns An acquired instance from the pool.
   */
  acquire(): T {
    const item = this.driver.acquire();
    if (this.resetOnAcquire) {
      tryResetItem(this.resetCallback, item);
    }
    return item;
  }

  /**
   * Returns a borrowed instance back to the pool.
   *
   * @param item - Instance to return.
   * @returns `true` if returned, `false` if rejected or invalid.
   */
  release(item?: T | null): boolean {
    if (!item) return false;
    this.activeHandles.delete(item);
    return this.driver.release(item);
  }

  /**
   * Borrows an item from the pool augmented with automatic `[Symbol.dispose]` semantics.
   * Perfectly suited for the TypeScript / ECMAScript `using` declaration.
   *
   * @returns The pooled item wrapped with RAII disposal contracts.
   *
   * @example
   * ```typescript
   * {
   *   using point = pool.borrow();
   *   point.x = 100;
   *   point.y = 200;
   * } // automatically released back to pool here!
   * ```
   */
  borrow(): Pooled<T> {
    const item = this.acquire();
    this.activeHandles.add(item);
    return attachDisposableHandle(item, () => this.release(item));
  }

  /**
   * Borrows multiple items from the pool as a strongly typed tuple augmented with RAII disposal.
   * When disposed (via `using` or `.dispose()`), all items in the tuple are released back to the pool.
   *
   * @template N - Number of items to borrow.
   * @param count - Count of items to borrow (1 to 8).
   * @returns Typed tuple array with RAII disposal contracts.
   *
   * @example
   * ```typescript
   * {
   *   using items = pool.borrowMany(2);
   *   const [p1, p2] = items;
   *   p1.x = 10;
   *   p2.x = 20;
   * } // Both p1 and p2 are automatically released!
   * ```
   */
  borrowMany<N extends number>(count: N): PooledTuple<T, N> {
    const safeCount = Math.max(1, count);
    const items: T[] = [];
    for (let i = 0; i < safeCount; i++) {
      const item = this.acquire();
      this.activeHandles.add(item);
      items.push(item);
    }
    return attachDisposableHandle(items, () => {
      for (const item of items) {
        this.release(item);
      }
    }) as PooledTuple<T, N>;
  }

  /**
   * Pre-allocates and warms up the pool storage up to `count` items.
   * Ensures that subsequent hot-path acquisitions are immediate zero-allocation hits.
   *
   * @param count - Minimum number of idle items to ensure in the pool.
   * @returns `this` for fluent chaining.
   *
   * @example
   * ```typescript
   * const pointPool = Pool.create(() => ({ x: 0, y: 0 })).prewarm(64);
   * ```
   */
  prewarm(count: number): this {
    this.driver.prewarm?.(count);
    return this;
  }

  /**
   * Scoped execution helper for a single pooled item.
   * Automatically guarantees that the item is released upon return or error.
   */
  use<R>(fn: (item: T) => R): R;
  /**
   * Scoped execution helper for `count` pooled items, provided as a strongly typed tuple.
   * Automatically guarantees that all borrowed items are released upon return or error.
   */
  use<N extends number, R>(count: N, fn: (items: TupleOf<T, N>) => R): R;
  use<R>(
    first: ((item: T) => R) | number,
    second?: (items: never) => R,
  ): R {
    if (typeof first === 'function') {
      const item = this.acquire();
      try {
        return first(item);
      } finally {
        this.release(item);
      }
    }

    if (typeof second !== 'function') {
      throw new TypeError('Expected callback function');
    }

    const count = Math.max(1, first);
    const items: T[] = [];
    try {
      for (let i = 0; i < count; i++) {
        items.push(this.acquire());
      }
      return second(items as never);
    } finally {
      for (const item of items) {
        this.release(item);
      }
    }
  }

  /**
   * Asynchronous scoped execution helper for a single pooled item.
   */
  async useAsync<R>(fn: (item: T) => Promise<R>): Promise<R>;
  /**
   * Asynchronous scoped execution helper for `count` pooled items as a strongly typed tuple.
   */
  async useAsync<N extends number, R>(count: N, fn: (items: TupleOf<T, N>) => Promise<R>): Promise<R>;
  async useAsync<R>(
    first: ((item: T) => Promise<R>) | number,
    second?: (items: never) => Promise<R>,
  ): Promise<R> {
    if (typeof first === 'function') {
      const item = this.acquire();
      try {
        return await first(item);
      } finally {
        this.release(item);
      }
    }

    if (typeof second !== 'function') {
      throw new TypeError('Expected callback function');
    }

    const count = Math.max(1, first);
    const items: T[] = [];
    try {
      for (let i = 0; i < count; i++) {
        items.push(this.acquire());
      }
      return await second(items as never);
    } finally {
      for (const item of items) {
        this.release(item);
      }
    }
  }

  /**
   * Number of available (unborrowed) instances currently resting in the pool.
   */
  get size(): number {
    return this.driver.size;
  }

  /**
   * Number of instances currently borrowed from the pool.
   */
  get inUse(): number {
    return this.driver.inUse;
  }

  /**
   * Maximum capacity of the pool.
   */
  get capacity(): number {
    return this.driver.capacity;
  }

  /**
   * Whether all pool slots are currently returned and available (`size === capacity`).
   */
  get isFull(): boolean {
    return this.driver.isFull;
  }

  /**
   * Whether the pool is currently exhausted (`size === 0`).
   */
  get isEmpty(): boolean {
    return this.driver.isEmpty;
  }

  /**
   * Telemetry metrics snapshot, if supported by the underlying driver.
   */
  getMetrics(): ObjectPoolMetrics | undefined {
    return this.driver.getMetrics?.();
  }

  /**
   * Empties the pool by clearing all cached idle instances.
   */
  clear(): void {
    this.driver.clear();
  }

  /**
   * Disposes the pool and destroys all pooled items.
   */
  dispose(): void {
    this.driver.dispose();
  }

  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}
