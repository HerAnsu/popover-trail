/**
 * Functional Ring-to-Ring Mapping and Filtering Transformations.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferTransform
 */

import { forEachItem } from './bufferIteration';
import type { BufferCapacity } from './bufferBranded';
import type {
  BufferPredicate,
  BufferTypeGuard,
  BufferTransform,
  ReadonlyRingBufferState,
} from './bufferTypes';
import type { RingBuffer } from './ringBufferCore';

/**
 * Transforms buffer elements by applying a mapping projection function to each item.
 * Preserves buffer capacity while creating a new strongly typed RingBuffer container.
 *
 * @param state - Current ring buffer state snapshot.
 * @param fn - Transformation function applied to each buffer entry.
 * @param createBuffer - Factory method to instantiate the result buffer.
 * @returns A newly populated RingBuffer instance containing mapped elements.
 */
export function mapRingBuffer<T, U>(
  state: ReadonlyRingBufferState<T>,
  fn: BufferTransform<T, U>,
  createBuffer: (capacity: BufferCapacity) => RingBuffer<U>,
): RingBuffer<U> {
  const result = createBuffer(state.capacity);
  forEachItem(state, (item, i) => result.push(fn(item, i)));
  return result;
}

/**
 * Filters elements of a ring buffer using a predicate or type guard into a new RingBuffer.
 *
 * @template T - Original item type.
 * @template S - Filtered subtype.
 * @param state - Current ring buffer state.
 * @param pred - Predicate or type guard function.
 * @param createBuffer - Factory callback to instantiate the result buffer.
 * @returns A new RingBuffer containing only matching items.
 *
 * @example
 * ```ts
 * const pinnedOnly = filterRingBuffer(buffer.state, (it) => it.isPinned, createBuf);
 * ```
 */
export function filterRingBuffer<T, S extends T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferTypeGuard<T, S>,
  createBuffer: (capacity: BufferCapacity) => RingBuffer<S>,
): RingBuffer<S>;
export function filterRingBuffer<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
  createBuffer: (capacity: BufferCapacity) => RingBuffer<T>,
): RingBuffer<T>;
export function filterRingBuffer<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
  createBuffer: (capacity: BufferCapacity) => RingBuffer<T>,
): RingBuffer<T> {
  const result = createBuffer(state.capacity);
  forEachItem(state, (item, i) => {
    if (pred(item, i)) result.push(item);
  });
  return result;
}

function isIterable<T>(val: unknown): val is Iterable<T> {
  return typeof val === 'object' && val !== null && Symbol.iterator in val;
}

/**
 * Maps each element using a mapping function and flattens the result into a new RingBuffer.
 *
 * @template T - Input item type.
 * @template U - Output item type.
 * @param state - Current ring buffer state.
 * @param fn - Mapping function returning either a single item or an iterable collection.
 * @param createBuffer - Factory callback to instantiate the result buffer.
 * @returns A new RingBuffer containing flattened items.
 *
 * @example
 * ```ts
 * const flattened = flatMapRingBuffer(buffer.state, (card) => card.tags, createBuf);
 * ```
 */
export function flatMapRingBuffer<T, U>(
  state: ReadonlyRingBufferState<T>,
  fn: BufferTransform<T, Iterable<U> | U>,
  createBuffer: (capacity: BufferCapacity) => RingBuffer<U>,
): RingBuffer<U> {
  const result = createBuffer(state.capacity);
  forEachItem(state, (item, i) => {
    const val = fn(item, i);
    if (isIterable<U>(val)) {
      for (const sub of val) result.push(sub);
    } else {
      result.push(val);
    }
  });
  return result;
}
