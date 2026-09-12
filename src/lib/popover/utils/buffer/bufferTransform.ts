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
