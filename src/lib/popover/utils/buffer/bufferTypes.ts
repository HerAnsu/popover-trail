/**
 * Type Contracts, Predicates, and Interfaces for Bounded Ring Buffers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferTypes
 */

import type { Result } from '../result';
import type {
  BufferCapacity,
  BufferLogicalIndex,
  BufferRevision,
  BufferRelativeIndex,
} from './bufferBranded';
import type { RingBufferMetrics } from './bufferMetrics';
import type { BufferEmptyError, IndexOutOfBoundsError } from './bufferErrors';
export type { RingBufferMetrics };
export * from './bufferStateTypes';

export type BufferConsumer<T> = (item: T, index: BufferLogicalIndex) => void;
export type BufferPredicate<T> = (item: T, index: BufferLogicalIndex) => boolean;
export type BufferTypeGuard<T, S extends T> = (item: T, index: BufferLogicalIndex) => item is S;
export type BufferReducer<T, U> = (accumulator: U, item: T, index: BufferLogicalIndex) => U;
export type BufferTransform<T, U> = (item: T, index: BufferLogicalIndex) => U;

export interface ReadonlyRingBuffer<T> extends Iterable<T> {
  readonly capacity: BufferCapacity;
  readonly size: number;
  readonly isEmpty: boolean;
  readonly isFull: boolean;
  readonly revision: BufferRevision;
  /** Peeks the most recently added item without removal. */
  peek(): T | undefined;
  peekOldest(): T | undefined;
  peekFirst(): T | undefined;
  peekLast(): T | undefined;
  /** Safe peek returning Ok(item) or Err(BufferEmptyError). */
  peekResult(): Result<T, BufferEmptyError>;
  /** Relative index lookup: supports positive offsets and negative wrap offsets. */
  at(relativeIndex: BufferRelativeIndex): T | undefined;
  /** Safe relative item lookup returning Ok(item) or Err(IndexOutOfBoundsError). */
  atResult(relativeIndex: BufferRelativeIndex): Result<T, IndexOutOfBoundsError>;
  find<S extends T>(predicate: BufferTypeGuard<T, S>): S | undefined;
  find(predicate: BufferPredicate<T>): T | undefined;
  findIndex(predicate: BufferPredicate<T>): BufferLogicalIndex | -1;
  findLast<S extends T>(predicate: BufferTypeGuard<T, S>): S | undefined;
  findLast(predicate: BufferPredicate<T>): T | undefined;
  findLastIndex(predicate: BufferPredicate<T>): BufferLogicalIndex | -1;
  indexOf(item: T, fromIndex?: BufferRelativeIndex): BufferLogicalIndex | -1;
  lastIndexOf(item: T, fromIndex?: BufferRelativeIndex): BufferLogicalIndex | -1;
  includes(item: T, fromIndex?: BufferRelativeIndex): boolean;
  some(predicate: BufferPredicate<T>): boolean;
  every(predicate: BufferPredicate<T>): boolean;
  reduce<U>(reducer: BufferReducer<T, U>, initialValue: U): U;
  reduceRight<U>(reducer: BufferReducer<T, U>, initialValue: U): U;
  map<U>(fn: BufferTransform<T, U>): ReadonlyRingBuffer<U>;
  flatMap<U>(fn: BufferTransform<T, Iterable<U> | U>): ReadonlyRingBuffer<U>;
  filter<S extends T>(predicate: BufferTypeGuard<T, S>): ReadonlyRingBuffer<S>;
  filter(predicate: BufferPredicate<T>): ReadonlyRingBuffer<T>;
  slice(start?: BufferRelativeIndex, end?: BufferRelativeIndex): T[];
  copyTo(target: (T | undefined)[], targetOffset?: BufferRelativeIndex): number;
  forEach(consumer: BufferConsumer<T>): void;
  forEachReversed(consumer: BufferConsumer<T>): void;
  keys(): IterableIterator<BufferLogicalIndex>;
  values(): IterableIterator<T>;
  entries(): IterableIterator<[BufferLogicalIndex, T]>;
  asReadonly(): ReadonlyRingBuffer<T>;
  getMetrics(): RingBufferMetrics;
  toArray(): T[];
  toReversedArray(): T[];
  toReadonlyArray(): readonly T[];
  /** Oldest (first inserted) item currently resting in the buffer. */
  readonly first: T | undefined;
  /** Most recently inserted item currently resting in the buffer. */
  readonly last: T | undefined;
  /** Zero-allocation iterator yielding items from newest to oldest. */
  valuesReversed(): IterableIterator<T>;
  /** Serializes the buffer elements into a plain JSON array for JSON.stringify. */
  toJSON(): T[];
}

