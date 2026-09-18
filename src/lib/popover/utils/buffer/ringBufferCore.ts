/**
 * High-Performance Bounded Ring Buffer & Container.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/ringBufferCore
 */

import { DISPOSE_SYMBOL, type ScopeDisposable } from '../resource';
import type { Result } from '../result';
import { resolveBufferConfig } from './bufferConfig';
import { createRingBufferState } from './bufferState';
import { cloneRing, resizeRing, shrinkRingToFit } from './bufferSlice';
import { mapRingBuffer, filterRingBuffer, flatMapRingBuffer } from './bufferTransform';
import {
  createRingBufferSafe,
  createRingBufferFromSafe,
  type BufferDomainError,
} from './bufferResult';
import { isArray } from './bufferGuards';
import { RingBufferDeque } from './ringBufferDeque';
import type { BufferCapacity } from './bufferBranded';
import type {
  RingBufferOptions,
  RingBufferMetrics,
  RingBufferState,
  ReadonlyRingBuffer,
  BufferPredicate,
  BufferTypeGuard,
  BufferTransform,
} from './bufferTypes';

/**
 * High-performance, zero-allocation bounded circular ring buffer with deque semantics (`push`, `pop`, `shift`, `unshift`).
 * Automatically reuses internal slots in O(1) time and evicts oldest items when capacity is reached.
 *
 * @template T - Stored element type.
 *
 * @example
 * ```typescript
 * const buffer = new RingBuffer<string>({ capacity: 3 });
 * buffer.push('a');
 * buffer.push('b');
 * buffer.push('c');
 * buffer.push('d'); // Evicts 'a' automatically
 * console.log(buffer.toArray()); // ['b', 'c', 'd']
 * ```
 */
export class RingBuffer<T>
  extends RingBufferDeque<T>
  implements ReadonlyRingBuffer<T>, ScopeDisposable
{

  override readonly state: RingBufferState<T>;

  /**
   * Safely instantiates a new `RingBuffer` validating capacity bounds and returning a Result monad.
   *
   * @template T - Buffer element type.
   * @param opt - Capacity number or options configuration object.
   * @param evict - Optional eviction callback.
   * @returns `Result.Ok` containing the `RingBuffer` or `Result.Err` with `BufferDomainError`.
   *
   * @example
   * ```typescript
   * const result = RingBuffer.create<number>(10);
   * if (result.isOk()) {
   *   const buf = result.value;
   * }
   * ```
   */
  static create<T>(
    opt: BufferCapacity | number | RingBufferOptions<T>,
    evict?: (i: T) => void,
  ): Result<RingBuffer<T>, BufferDomainError> {
    return createRingBufferSafe(opt, evict, (o, e) => new RingBuffer(o, e));
  }

  /**
   * Safely instantiates a new `RingBuffer` pre-populated with items from an Iterable.
   *
   * @template T - Buffer element type.
   * @param items - Iterable sequence of initial elements.
   * @param cap - Buffer capacity.
   * @returns `Result.Ok` containing the buffer or `Result.Err` on validation failure.
   *
   * @example
   * ```typescript
   * const result = RingBuffer.from(['a', 'b', 'c'], 5);
   * ```
   */
  static from<T>(
    items: Iterable<T>,
    cap?: BufferCapacity | number,
  ): Result<RingBuffer<T>, BufferDomainError> {
    return createRingBufferFromSafe(items, cap, (o, e) => new RingBuffer(o, e));
  }

  constructor(
    options: BufferCapacity | number | RingBufferOptions<T>,
    onEvict?: (item: T) => void,
  ) {
    super();
    this.state = createRingBufferState(resolveBufferConfig(options, onEvict));
    if (typeof options === 'object' && options.initialItems) this.pushMany(options.initialItems);
  }

  /**
   * Transforms elements through a mapping function into a new `RingBuffer`.
   *
   * @template U - Transformed element type.
   * @param fn - Mapping function receiving element and index.
   * @returns New `RingBuffer<U>` containing mapped elements.
   *
   * @example
   * ```typescript
   * const lengths = buffer.map((s) => s.length);
   * ```
   */
  map<U>(fn: BufferTransform<T, U>): RingBuffer<U> {
    return mapRingBuffer(this.state, fn, (cap) => new RingBuffer<U>(cap));
  }

  /**
   * Transforms each element into an Iterable and flattens into a new `RingBuffer`.
   *
   * @template U - Transformed element type.
   * @param fn - Mapping function returning iterable items or individual items.
   * @returns New `RingBuffer<U>` with flattened values.
   */
  flatMap<U>(fn: BufferTransform<T, Iterable<U> | U>): RingBuffer<U> {
    return flatMapRingBuffer(this.state, fn, (cap) => new RingBuffer<U>(cap));
  }

  /**
   * Filters elements matching a predicate into a new `RingBuffer`.
   *
   * @param predicate - Filter predicate or type guard.
   * @returns New `RingBuffer` with elements that satisfy `predicate`.
   */
  filter<S extends T>(predicate: BufferTypeGuard<T, S>): RingBuffer<S>;
  filter(predicate: BufferPredicate<T>): RingBuffer<T>;
  filter(predicate: BufferPredicate<T>): RingBuffer<T> {
    return filterRingBuffer(this.state, predicate, (cap) => new RingBuffer(cap));
  }

  /**
   * Creates an independent clone of this `RingBuffer` preserving elements and capacity.
   *
   * @returns New cloned `RingBuffer`.
   */
  clone(): RingBuffer<T> {
    return cloneRing(this.state, (opt) => new RingBuffer<T>(opt));
  }

  /**
   * Adjusts the maximum capacity of the ring buffer, evicting oldest elements if capacity is decreased.
   *
   * @param newCapacity - New maximum capacity.
   */
  resize(newCapacity: BufferCapacity | number): void {
    resizeRing(this.state, newCapacity);
  }

  /**
   * Shrinks internal buffer capacity to match the current count of elements.
   */
  shrinkToFit(): void {
    shrinkRingToFit(this.state);
  }

  /**
   * Moves all buffer elements into the specified target array and clears the buffer.
   *
   * @param target - Destination array.
   * @returns Number of elements transferred.
   *
   * @example
   * ```typescript
   * const out: string[] = [];
   * const count = buffer.drainInto(out);
   * ```
   */
  drainInto(target: T[]): number {
    if (!isArray(target)) return 0;
    const count = this.state.count;
    this.forEach((item) => target.push(item));
    this.clear();
    return count;
  }

  /**
   * Disposes the ring buffer by clearing all element references.
   */
  dispose(): void {
    this.clear();
  }

  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }

  /**
   * Returns a snapshot of buffer performance and utilization metrics.
   *
   * @returns Snapshot metrics object.
   */
  getMetrics(): RingBufferMetrics {
    return this.metrics.getSnapshot(this.state.count, this.state.capacity);
  }

  /**
   * Returns a read-only view of this `RingBuffer`.
   *
   * @returns Readonly ring buffer interface.
   */
  asReadonly(): ReadonlyRingBuffer<T> {
    return this;
  }
}
