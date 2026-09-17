/**
 * High-Performance Preallocated Monomorphic Slab Pool for Sub-Microsecond Paths.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/fixedPool
 */

import { DISPOSE_SYMBOL } from '../disposable';
import { clamp } from '../math';
import { type PoolCapacity, toPoolCapacity } from './poolBranded';
import { tryResetItem } from './poolOperations';
import { runWithItem } from './poolScope';

/**
 * Fixed-capacity, pre-allocated monomorphic slab pool for sub-microsecond, zero-GC execution paths.
 *
 * @template T - Type of pooled resource.
 *
 * @example
 * ```typescript
 * const pool = new FixedPool(() => ({ x: 0, y: 0 }), 16, (pt) => { pt.x = 0; pt.y = 0; });
 * const pt = pool.acquire();
 * pt.x = 100;
 * pool.release(pt);
 * ```
 */
export class FixedPool<T> {
  private readonly slots: T[];
  private head = 0;
  readonly capacity: PoolCapacity;
  private readonly factory: () => T;
  private readonly reset?: (item: T) => void;

  /**
   * Constructs a new FixedPool.
   *
   * @param factory - Resource instantiation factory.
   * @param capacity - Fixed maximum capacity (default: 32).
   * @param reset - Optional callback to reset item state upon release.
   *
   * @example
   * ```typescript
   * const pool = new FixedPool(() => new Float32Array(4), 8);
   * ```
   */
  constructor(factory: () => T, capacity: number | PoolCapacity = 32, reset?: (item: T) => void) {
    this.factory = factory;
    this.reset = reset;
    this.capacity = toPoolCapacity(capacity);
    this.slots = Array.from({ length: this.capacity }, factory);
    this.head = this.capacity;
  }

  /**
   * Borrows an instance from the pool. If the pool is exhausted, creates a new instance via factory.
   *
   * @returns An acquired instance from the pool or freshly created.
   *
   * @example
   * ```typescript
   * const item = pool.acquire();
   * ```
   */
  acquire(): T {
    if (this.head > 0) {
      const item = this.slots[--this.head];
      if (item !== undefined) return item;
    }
    return this.factory();
  }

  /**
   * Returns a borrowed instance back to the pool after running the optional reset callback.
   *
   * @param item - Instance to return.
   * @returns `true` if returned, `false` if rejected (null, undefined, or pool at capacity).
   *
   * @example
   * ```typescript
   * pool.release(item);
   * ```
   */
  release(item?: T | null): boolean {
    if (item === null || item === undefined || this.head >= this.capacity) {
      return false;
    }
    tryResetItem(this.reset, item);
    this.slots[this.head++] = item;
    return true;
  }

  /**
   * Scoped execution helper: acquires an instance, passes it to `fn`, and automatically releases it.
   *
   * @template R - Return value type of work function.
   * @param fn - Work function receiving the pooled item.
   * @returns The result of `fn`.
   *
   * @example
   * ```typescript
   * const distance = pool.runWith((pt) => {
   *   pt.x = 3; pt.y = 4;
   *   return Math.hypot(pt.x, pt.y);
   * });
   * ```
   */
  runWith<R>(fn: (item: T) => R): R {
    return runWithItem(
      () => this.acquire(),
      (i) => this.release(i),
      fn,
    );
  }

  get size(): number {
    return this.head;
  }

  get inUse(): number {
    return clamp(this.capacity - this.head, 0, Infinity);
  }

  get isFull(): boolean {
    return this.head >= this.capacity;
  }

  get isEmpty(): boolean {
    return this.head === 0;
  }

  clear(): void {
    this.head = 0;
  }

  dispose(): void {
    this.clear();
  }

  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}
