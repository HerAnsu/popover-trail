/**
 * Zero-Allocation Iteration and Relative Access for Bounded Ring Buffers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferIteration
 */

import { getBufferItem } from './bufferIndex';
import { toLogicalIndex, isLogicalIndex, type BufferLogicalIndex } from './bufferBranded';
import type { BufferConsumer, ReadonlyRingBufferState } from './bufferTypes';

export function forEachItem<T>(state: ReadonlyRingBufferState<T>, fn: BufferConsumer<T>): void {
  for (let i = 0; i < state.count; i++) {
    const idx = toLogicalIndex(i);
    const item = getBufferItem(state, idx);
    if (item !== undefined) fn(item, idx);
  }
}

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

export function itemAt<T>(
  state: ReadonlyRingBufferState<T>,
  relativeIndex: BufferLogicalIndex | number,
): T | undefined {
  const norm = relativeIndex < 0 ? state.count + relativeIndex : relativeIndex;
  if (!isLogicalIndex(norm) || norm >= state.count) return undefined;
  return getBufferItem(state, toLogicalIndex(norm));
}

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

export function toArrayRing<T>(state: ReadonlyRingBufferState<T>): T[] {
  const res: T[] = [];
  forEachItem(state, (it) => res.push(it));
  return res;
}

export function toReversedArrayRing<T>(state: ReadonlyRingBufferState<T>): T[] {
  const res: T[] = [];
  forEachReversedItem(state, (it) => res.push(it));
  return res;
}
