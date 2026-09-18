/**
 * High-Performance Bounded Circular Ring Buffer & Deque Container.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/ringBufferCore
 */

import { DISPOSE_SYMBOL, type ScopeDisposable } from '../resource/disposableTypes';
import type { Result } from '../result';
import { resolveBufferConfig } from './bufferConfig';
import { createRingBufferState, clearRingBufferState } from './bufferState';
import { cloneRing, resizeRing, shrinkRingToFit, sliceRing, copyRingTo } from './bufferSlice';
import { mapRingBuffer, filterRingBuffer, flatMapRingBuffer } from './bufferTransform';
import {
  createRingBufferSafe,
  createRingBufferFromSafe,
  type BufferDomainError,
} from './bufferResult';
import { isArray, isIterable, isBufferEmpty, isBufferFull } from './bufferGuards';
import { BufferMetricsTracker } from './bufferMetrics';
import { pushItem, popItem, shiftItem, unshiftItem } from './bufferQueue';
import {
  popRingResult,
  shiftRingResult,
  tryPushRing,
  tryUnshiftRing,
  peekRingResult,
  peekFirstRingResult,
  itemAtRingResult,
} from './bufferMonadic';
import {
  swapBufferItems,
  reverseBuffer,
  fillBuffer,
  removeAtInRing,
  removeInRing,
  drainRing,
} from './bufferMutation';
import {
  forEachItem,
  forEachReversedItem,
  itemAt,
  createBufferIterator,
  createBufferEntriesIterator,
  createBufferKeysIterator,
  createBufferReversedIterator,
  createSlidingPairsIterator,
  createWindowsIterator,
  bufferToArray,
  bufferToReversedArray,
} from './bufferIteration';
import {
  findInRing,
  findIndexInRing,
  findLastInRing,
  findLastIndexInRing,
  indexOfInRing,
  lastIndexOfInRing,
  includesInRing,
  someInRing,
  everyInRing,
  countInRing,
  takeFromRing,
  takeLastFromRing,
  reduceInRing,
  reduceRightInRing,
} from './bufferSearch';
import type {
  BufferCapacity,
  BufferRevision,
  BufferLogicalIndex,
  BufferRelativeIndex,
} from './bufferBranded';
import type {
  RingBufferOptions,
  RingBufferMetrics,
  RingBufferState,
  ReadonlyRingBuffer,
  BufferPredicate,
  BufferTypeGuard,
  BufferTransform,
  BufferConsumer,
  BufferReducer,
} from './bufferTypes';
import type { BufferEmptyError, BufferOverflowError, IndexOutOfBoundsError } from './bufferErrors';

/**
 * High-performance, zero-allocation bounded circular ring buffer with deque semantics (`push`, `pop`, `shift`, `unshift`).
 * Automatically reuses internal slots in O(1) time and evicts oldest items when capacity is reached.
 *
 * Implemented as a single, cohesive flat class with functional composition and native `Symbol.dispose` support.
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
export class RingBuffer<T> implements ReadonlyRingBuffer<T>, ScopeDisposable {
  readonly state: RingBufferState<T>;
  protected readonly metrics = new BufferMetricsTracker();

  /**
   * Safely instantiates a new `RingBuffer` validating capacity bounds and returning a Result monad.
   */
  static create<T>(
    opt: BufferCapacity | number | RingBufferOptions<T>,
    evict?: (i: T) => void,
  ): Result<RingBuffer<T>, BufferDomainError> {
    return createRingBufferSafe(opt, evict, (o, e) => new RingBuffer(o, e));
  }

  /**
   * Safely instantiates a new `RingBuffer` pre-populated with items from an Iterable.
   */
  static from<T>(
    items: Iterable<T>,
    cap?: BufferCapacity | number,
  ): Result<RingBuffer<T>, BufferDomainError> {
    return createRingBufferFromSafe(items, cap, (o, e) => new RingBuffer(o, e));
  }

  /**
   * Instantiates a `RingBuffer` populated with the specified elements.
   *
   * @template T - Stored element type.
   * @param items - Items to populate into the buffer.
   * @returns Configured `RingBuffer<T>` instance.
   */
  static of<T>(...items: T[]): RingBuffer<T> {
    const cap = Math.max(1, items.length);
    const ring = new RingBuffer<T>(cap);
    ring.pushMany(items);
    return ring;
  }

  constructor(
    options: BufferCapacity | number | RingBufferOptions<T>,
    onEvict?: (item: T) => void,
  ) {
    this.state = createRingBufferState(resolveBufferConfig(options, onEvict));
    if (typeof options === 'object' && options.initialItems) this.pushMany(options.initialItems);
  }

  // --- Capacity and Status Getters ---

  get capacity(): BufferCapacity { return this.state.capacity; }
  get size(): number { return this.state.count; }
  get isEmpty(): boolean { return isBufferEmpty(this.state); }
  get isFull(): boolean { return isBufferFull(this.state); }
  get revision(): BufferRevision { return this.state.revision; }

  // --- Deque Mutators (Fluent Chaining) ---

  push(item: T): this {
    pushItem(this.state, this.metrics, item, (cap) => this.resize(cap));
    return this;
  }

  pushMany(items: Iterable<T>): this {
    if (!isIterable(items)) return this;
    for (const item of items) this.push(item);
    return this;
  }

  tryPush(item: T): Result<void, BufferOverflowError> {
    return tryPushRing(this.state, this.metrics, item, (cap) => this.resize(cap));
  }

  tryUnshift(item: T): Result<void, BufferOverflowError> {
    return tryUnshiftRing(this.state, this.metrics, item, (cap) => this.resize(cap));
  }

  pop(): T | undefined {
    return popItem(this.state, this.metrics);
  }

  popResult(): Result<T, BufferEmptyError> {
    return popRingResult(this.state, this.metrics);
  }

  shift(): T | undefined {
    return shiftItem(this.state, this.metrics);
  }

  shiftResult(): Result<T, BufferEmptyError> {
    return shiftRingResult(this.state, this.metrics);
  }

  unshift(item: T): this {
    unshiftItem(this.state, this.metrics, item, (cap) => this.resize(cap));
    return this;
  }

  remove(item: T): boolean {
    return removeInRing(this.state, item);
  }

  removeAt(index: BufferRelativeIndex): T | undefined {
    return removeAtInRing(this.state, index);
  }

  swap(indexA: BufferRelativeIndex, indexB: BufferRelativeIndex): boolean {
    return swapBufferItems(this.state, indexA, indexB);
  }

  reverse(): this {
    reverseBuffer(this.state);
    return this;
  }

  fill(value: T): this {
    fillBuffer(this.state, value);
    return this;
  }

  clear(): this {
    clearRingBufferState(this.state);
    return this;
  }

  // --- Inspection & Peek ---

  get first(): T | undefined { return this.peekFirst(); }
  get last(): T | undefined { return this.peekLast(); }

  peek(): T | undefined { return this.at(-1); }
  peekOldest(): T | undefined { return this.at(0); }
  peekFirst(): T | undefined { return this.at(0); }
  peekLast(): T | undefined { return this.at(-1); }

  peekResult(): Result<T, BufferEmptyError> { return peekRingResult(this.state); }
  peekFirstResult(): Result<T, BufferEmptyError> { return peekFirstRingResult(this.state); }
  peekLastResult(): Result<T, BufferEmptyError> { return peekRingResult(this.state); }

  at(relativeIndex: BufferRelativeIndex): T | undefined {
    return itemAt(this.state, relativeIndex);
  }

  atResult(relativeIndex: BufferRelativeIndex): Result<T, IndexOutOfBoundsError> {
    return itemAtRingResult(this.state, relativeIndex);
  }

  // --- Queries & Searches ---

  find<S extends T>(predicate: BufferTypeGuard<T, S>): S | undefined;
  find(predicate: BufferPredicate<T>): T | undefined;
  find(predicate: BufferPredicate<T>): T | undefined {
    return findInRing(this.state, predicate);
  }

  findIndex(predicate: BufferPredicate<T>): BufferLogicalIndex | -1 {
    return findIndexInRing(this.state, predicate);
  }

  findLast<S extends T>(predicate: BufferTypeGuard<T, S>): S | undefined;
  findLast(predicate: BufferPredicate<T>): T | undefined;
  findLast(predicate: BufferPredicate<T>): T | undefined {
    return findLastInRing(this.state, predicate);
  }

  findLastIndex(predicate: BufferPredicate<T>): BufferLogicalIndex | -1 {
    return findLastIndexInRing(this.state, predicate);
  }

  indexOf(item: T, fromIndex?: BufferRelativeIndex): BufferLogicalIndex | -1 {
    return indexOfInRing(this.state, item, fromIndex);
  }

  lastIndexOf(item: T, fromIndex?: BufferRelativeIndex): BufferLogicalIndex | -1 {
    return lastIndexOfInRing(this.state, item, fromIndex);
  }

  includes(item: T, fromIndex?: BufferRelativeIndex): boolean {
    return includesInRing(this.state, item, fromIndex);
  }

  some(predicate: BufferPredicate<T>): boolean {
    return someInRing(this.state, predicate);
  }

  every(predicate: BufferPredicate<T>): boolean {
    return everyInRing(this.state, predicate);
  }

  count(predicate: BufferPredicate<T>): number {
    return countInRing(this.state, predicate);
  }

  reduce<U>(reducer: BufferReducer<T, U>, initialValue: U): U {
    return reduceInRing(this.state, reducer, initialValue);
  }

  reduceRight<U>(reducer: BufferReducer<T, U>, initialValue: U): U {
    return reduceRightInRing(this.state, reducer, initialValue);
  }

  // --- Iteration & Conversions ---

  forEach(consumer: BufferConsumer<T>): void { forEachItem(this.state, consumer); }
  forEachReversed(consumer: BufferConsumer<T>): void { forEachReversedItem(this.state, consumer); }
  keys(): IterableIterator<BufferLogicalIndex> { return createBufferKeysIterator(this.state); }
  values(): IterableIterator<T> { return createBufferIterator(this.state); }
  entries(): IterableIterator<[BufferLogicalIndex, T]> { return createBufferEntriesIterator(this.state); }
  [Symbol.iterator](): IterableIterator<T> { return this.values(); }
  valuesReversed(): IterableIterator<T> { return createBufferReversedIterator(this.state); }
  slidingPairs(): IterableIterator<[T, T]> { return createSlidingPairsIterator(this.state); }
  windows(size: number, step = 1): IterableIterator<T[]> { return createWindowsIterator(this.state, size, step); }
  take(n: number): T[] { return takeFromRing(this.state, n); }
  takeLast(n: number): T[] { return takeLastFromRing(this.state, n); }
  toJSON(): T[] { return this.toArray(); }
  toArray(): T[] { return bufferToArray(this.state); }
  toReversedArray(): T[] { return bufferToReversedArray(this.state); }
  toReadonlyArray(): readonly T[] { return this.toArray(); }
  slice(start?: BufferRelativeIndex, end?: BufferRelativeIndex): T[] { return sliceRing(this.state, start, end); }
  copyTo(target: (T | undefined)[], offset: BufferRelativeIndex = 0): number { return copyRingTo(this.state, target, offset); }

  // --- Transformations & Structural Operations ---

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

  resize(newCapacity: BufferCapacity | number): this {
    resizeRing(this.state, newCapacity);
    return this;
  }

  shrinkToFit(): this {
    shrinkRingToFit(this.state);
    return this;
  }

  drain(): IterableIterator<T> {
    return drainRing(this.state, this.metrics);
  }

  drainInto(target: T[]): number {
    if (!isArray(target)) return 0;
    const count = this.state.count;
    this.forEach((item) => target.push(item));
    this.clear();
    return count;
  }

  // --- Lifecycle & Metrics ---

  dispose(): void { this.clear(); }
  [DISPOSE_SYMBOL](): void { this.dispose(); }
  getMetrics(): RingBufferMetrics { return this.metrics.getSnapshot(this.state.count, this.state.capacity); }
  asReadonly(): ReadonlyRingBuffer<T> { return this; }
}
