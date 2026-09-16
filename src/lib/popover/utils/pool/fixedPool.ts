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

export class FixedPool<T> {
  private readonly slots: T[];
  private head = 0;
  readonly capacity: PoolCapacity;
  private readonly factory: () => T;
  private readonly reset?: (item: T) => void;

  constructor(factory: () => T, capacity: number | PoolCapacity = 32, reset?: (item: T) => void) {
    this.factory = factory;
    this.reset = reset;
    this.capacity = toPoolCapacity(capacity);
    this.slots = Array.from({ length: this.capacity }, factory);
    this.head = this.capacity;
  }

  /**
   * Borrows an instance from the pool. If the pool is exhausted, creates a new instance via factory.
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
   * @param fn - Work function receiving the pooled item.
   * @returns The result of `fn`.
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
