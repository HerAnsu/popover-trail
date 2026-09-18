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

  static create<T>(
    opt: BufferCapacity | number | RingBufferOptions<T>,
    evict?: (i: T) => void,
  ): Result<RingBuffer<T>, BufferDomainError> {
    return createRingBufferSafe(opt, evict, (o, e) => new RingBuffer(o, e));
  }
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

  map<U>(fn: BufferTransform<T, U>): RingBuffer<U> {
    return mapRingBuffer(this.state, fn, (cap) => new RingBuffer<U>(cap));
  }
  flatMap<U>(fn: BufferTransform<T, Iterable<U> | U>): RingBuffer<U> {
    return flatMapRingBuffer(this.state, fn, (cap) => new RingBuffer<U>(cap));
  }
  filter<S extends T>(predicate: BufferTypeGuard<T, S>): RingBuffer<S>;
  filter(predicate: BufferPredicate<T>): RingBuffer<T>;
  filter(predicate: BufferPredicate<T>): RingBuffer<T> {
    return filterRingBuffer(this.state, predicate, (cap) => new RingBuffer(cap));
  }
  clone(): RingBuffer<T> {
    return cloneRing(this.state, (opt) => new RingBuffer<T>(opt));
  }
  resize(newCapacity: BufferCapacity | number): void {
    resizeRing(this.state, newCapacity);
  }
  shrinkToFit(): void {
    shrinkRingToFit(this.state);
  }

  drainInto(target: T[]): number {
    if (!isArray(target)) return 0;
    const count = this.state.count;
    this.forEach((item) => target.push(item));
    this.clear();
    return count;
  }
  dispose(): void {
    this.clear();
  }
  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
  getMetrics(): RingBufferMetrics {
    return this.metrics.getSnapshot(this.state.count, this.state.capacity);
  }
  asReadonly(): ReadonlyRingBuffer<T> {
    return this;
  }
}
