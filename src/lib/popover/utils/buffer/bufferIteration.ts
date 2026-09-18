/**
 * Zero-Allocation Iteration and Relative Access for Bounded Ring Buffers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferIteration
 */

import { getBufferItem } from './bufferIndex';
import { toLogicalIndex, isLogicalIndex, type BufferLogicalIndex } from './bufferBranded';
import type { BufferConsumer, ReadonlyRingBufferState } from './bufferTypes';

/**
 * Iterates over each item in logical FIFO insertion order (oldest to newest).
 *
 * @template T - Type of elements stored in the buffer.
 * @param state - Target buffer state.
 * @param fn - Consumer callback receiving each item and its logical index.
 *
 * @example
 * ```typescript
 * forEachItem(state, (item, index) => {
 *   console.log(`[${index}]:`, item);
 * });
 * ```
 */
export function forEachItem<T>(state: ReadonlyRingBufferState<T>, fn: BufferConsumer<T>): void {
  for (let i = 0; i < state.count; i++) {
    const idx = toLogicalIndex(i);
    const item = getBufferItem(state, idx);
    if (item !== undefined) fn(item, idx);
  }
}

/**
 * Iterates over each item in reverse logical insertion order (newest to oldest).
 *
 * @template T - Type of elements stored in the buffer.
 * @param state - Target buffer state.
 * @param fn - Consumer callback receiving each item and its relative loop index.
 *
 * @example
 * ```typescript
 * forEachReversedItem(state, (item) => {
 *   console.log('Most recent item:', item);
 * });
 * ```
 */
export function forEachReversedItem<T>(
  state: ReadonlyRingBufferState<T>,
  fn: BufferConsumer<T>,
): void {
  for (let i = 0; i < state.count; i++) {
    const idx = toLogicalIndex(i);
    const item = getBufferItem(state, toLogicalIndex(state.count - 1 - i));
    if (item !== undefined) fn(item, idx);
  }
}

/**
 * Retrieves an item at a relative index supporting positive (0..count-1) and negative (-1..-count) indexing.
 *
 * @template T - Type of elements stored in the buffer.
 * @param state - Target buffer state.
 * @param relativeIndex - 0-based offset or negative relative offset from end (-1 = newest).
 * @returns The element at `relativeIndex` or `undefined` if out of bounds.
 *
 * @example
 * ```typescript
 * const oldest = itemAt(state, 0);
 * const newest = itemAt(state, -1);
 * ```
 */
export function itemAt<T>(
  state: ReadonlyRingBufferState<T>,
  relativeIndex: BufferLogicalIndex | number,
): T | undefined {
  const norm = relativeIndex < 0 ? state.count + relativeIndex : relativeIndex;
  if (!isLogicalIndex(norm) || norm >= state.count) return undefined;
  return getBufferItem(state, toLogicalIndex(norm));
}

/**
 * Creates an iterable iterator over all active values in FIFO order.
 *
 * @template T - Type of elements stored in the buffer.
 * @param state - Target buffer state.
 * @returns An `IterableIterator<T>` over the active elements.
 *
 * @example
 * ```typescript
 * for (const val of createBufferIterator(state)) {
 *   console.log(val);
 * }
 * ```
 */
export function createBufferIterator<T>(state: ReadonlyRingBufferState<T>): IterableIterator<T> {
  let cur = 0;
  return {
    next(): IteratorResult<T> {
      if (cur >= state.count) return { done: true, value: undefined };
      const val = getBufferItem(state, toLogicalIndex(cur++));
      return val !== undefined ? { done: false, value: val } : { done: true, value: undefined };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}

/**
 * Creates an iterable iterator yielding `[index, value]` tuples in FIFO order.
 *
 * @template T - Type of elements stored in the buffer.
 * @param state - Target buffer state.
 * @returns An `IterableIterator<[BufferLogicalIndex, T]>`.
 *
 * @example
 * ```typescript
 * for (const [idx, item] of createBufferEntriesIterator(state)) {
 *   console.log(idx, item);
 * }
 * ```
 */
export function createBufferEntriesIterator<T>(
  state: ReadonlyRingBufferState<T>,
): IterableIterator<[BufferLogicalIndex, T]> {
  let cur = 0;
  return {
    next(): IteratorResult<[BufferLogicalIndex, T]> {
      if (cur >= state.count) return { done: true, value: undefined };
      const idx = toLogicalIndex(cur++);
      const val = getBufferItem(state, idx);
      return val !== undefined
        ? { done: false, value: [idx, val] }
        : { done: true, value: undefined };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}

/**
 * Creates an iterable iterator yielding logical index keys in FIFO order.
 *
 * @template T - Type of elements stored in the buffer.
 * @param state - Target buffer state.
 * @returns An `IterableIterator<BufferLogicalIndex>`.
 *
 * @example
 * ```typescript
 * const keys = Array.from(createBufferKeysIterator(state));
 * ```
 */
export function createBufferKeysIterator<T = unknown>(
  state: ReadonlyRingBufferState<T>,
): IterableIterator<BufferLogicalIndex> {
  let cur = 0;
  return {
    next(): IteratorResult<BufferLogicalIndex> {
      if (cur >= state.count) return { done: true, value: undefined };
      return { done: false, value: toLogicalIndex(cur++) };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}

/**
 * Copies all active circular buffer elements into a newly allocated standard JavaScript array in FIFO order.
 *
 * @template T - Type of elements stored in the buffer.
 * @param state - Target buffer state.
 * @returns Array containing active buffer elements in logical order.
 *
 * @example
 * ```typescript
 * const list = bufferToArray(state);
 * ```
 */
export function bufferToArray<T>(state: ReadonlyRingBufferState<T>): T[] {
  const res: T[] = [];
  forEachItem(state, (it) => res.push(it));
  return res;
}

/**
 * Copies all active circular buffer elements into a newly allocated standard JavaScript array in reverse order.
 *
 * @template T - Type of elements stored in the buffer.
 * @param state - Target buffer state.
 * @returns Array containing active buffer elements in reverse logical order.
 *
 * @example
 * ```typescript
 * const reversedList = bufferToReversedArray(state);
 * ```
 */
export function bufferToReversedArray<T>(state: ReadonlyRingBufferState<T>): T[] {
  const res: T[] = [];
  forEachReversedItem(state, (it) => res.push(it));
  return res;
}

/**
 * Creates an iterable iterator yielding items in reverse logical order (newest to oldest).
 * Operates with zero heap allocations.
 *
 * @template T - Type of elements stored in the buffer.
 * @param state - Target buffer state.
 * @returns An `IterableIterator<T>` moving backwards from tail to head.
 *
 * @example
 * ```typescript
 * for (const item of createBufferReversedIterator(state)) {
 *   console.log(item);
 * }
 * ```
 */
export function createBufferReversedIterator<T>(
  state: ReadonlyRingBufferState<T>,
): IterableIterator<T> {
  let cur = state.count - 1;
  return {
    next(): IteratorResult<T> {
      if (cur < 0) return { done: true, value: undefined };
      const val = getBufferItem(state, toLogicalIndex(cur--));
      return val !== undefined
        ? { done: false, value: val }
        : { done: true, value: undefined };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}

