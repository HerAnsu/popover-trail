/**
 * Zero-Allocation In-Place Mutation Primitives for Bounded Ring Buffers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferMutation
 */

import { getPhysicalIndex } from './bufferIndex';
import { isLogicalIndex, nextRevision, type BufferRelativeIndex } from './bufferBranded';
import type { RingBufferState } from './bufferStateTypes';
import { shiftItem } from './bufferQueue';
import type { BufferMetricsTracker } from './bufferMetrics';

/**
 * Swaps two elements in-place within the ring buffer using logical or negative relative indices.
 *
 * @template T - Type of elements stored in the buffer.
 * @param state - Target buffer state.
 * @param indexA - Relative or logical index of first item (supports negative relative indexing).
 * @param indexB - Relative or logical index of second item (supports negative relative indexing).
 * @returns `true` if elements were swapped; `false` if either index was out of bounds.
 *
 * @example
 * ```typescript
 * swapBufferItems(state, 0, -1); // Swap first and last elements
 * ```
 */
export function swapBufferItems<T>(
  state: RingBufferState<T>,
  indexA: BufferRelativeIndex,
  indexB: BufferRelativeIndex,
): boolean {
  const normA = indexA < 0 ? state.count + indexA : indexA;
  const normB = indexB < 0 ? state.count + indexB : indexB;
  if (!isLogicalIndex(normA) || normA >= state.count) return false;
  if (!isLogicalIndex(normB) || normB >= state.count) return false;
  if (normA === normB) return true;
  const physA = getPhysicalIndex(state, normA);
  const physB = getPhysicalIndex(state, normB);
  const temp = state.buffer[physA];
  state.buffer[physA] = state.buffer[physB];
  state.buffer[physB] = temp;
  state.revision = nextRevision(state.revision);
  return true;
}

/**
 * Reverses all active elements in-place within the circular buffer without allocating scratch arrays.
 *
 * @template T - Type of elements stored in the buffer.
 * @param state - Target buffer state to reverse.
 *
 * @example
 * ```typescript
 * reverseBuffer(state);
 * ```
 */
export function reverseBuffer<T>(state: RingBufferState<T>): void {
  if (state.count <= 1) return;
  const half = Math.floor(state.count / 2);
  for (let i = 0; i < half; i++) {
    const physA = getPhysicalIndex(state, i);
    const physB = getPhysicalIndex(state, state.count - 1 - i);
    const temp = state.buffer[physA];
    state.buffer[physA] = state.buffer[physB];
    state.buffer[physB] = temp;
  }
  state.revision = nextRevision(state.revision);
}

/**
 * Replaces all active element slots in the circular buffer with the specified value.
 *
 * @template T - Type of elements stored in the buffer.
 * @param state - Target buffer state.
 * @param value - Value to overwrite active slots with.
 *
 * @example
 * ```typescript
 * fillBuffer(state, null);
 * ```
 */
export function fillBuffer<T>(state: RingBufferState<T>, value: T): void {
  for (let i = 0; i < state.count; i++) {
    state.buffer[getPhysicalIndex(state, i)] = value;
  }
  state.revision = nextRevision(state.revision);
}

/**
 * Removes an element at the specified relative or logical index, shifting subsequent elements in-place.
 *
 * @template T - Type of elements stored in the buffer.
 * @param state - Target buffer state.
 * @param index - Target index (supports negative relative offsets).
 * @returns The removed element or undefined if index is out of bounds.
 *
 * @example
 * ```typescript
 * const removed = removeAtInRing(state, 2);
 * ```
 */
export function removeAtInRing<T>(
  state: RingBufferState<T>,
  index: BufferRelativeIndex,
): T | undefined {
  if (state.count === 0) return undefined;
  const offset = index < 0 ? state.count + index : index;
  if (!isLogicalIndex(offset) || offset >= state.count) return undefined;

  const targetPhys = getPhysicalIndex(state, offset);
  const removed = state.buffer[targetPhys];

  for (let i = offset; i < state.count - 1; i++) {
    const currPhys = getPhysicalIndex(state, i);
    const nextPhys = getPhysicalIndex(state, i + 1);
    state.buffer[currPhys] = state.buffer[nextPhys];
  }

  const lastPhys = getPhysicalIndex(state, state.count - 1);
  state.buffer[lastPhys] = undefined;
  state.count--;
  state.revision = nextRevision(state.revision);
  return removed;
}

/**
 * Removes the first occurrence of an item from the buffer, shifting elements in-place.
 *
 * @template T - Type of elements stored in the buffer.
 * @param state - Target buffer state.
 * @param item - Value to locate and remove.
 * @returns `true` if item was found and removed; `false` otherwise.
 *
 * @example
 * ```typescript
 * const removed = removeInRing(state, 'card-1');
 * ```
 */
export function removeInRing<T>(state: RingBufferState<T>, item: T): boolean {
  for (let i = 0; i < state.count; i++) {
    const phys = getPhysicalIndex(state, i);
    if (state.buffer[phys] === item) {
      removeAtInRing(state, i);
      return true;
    }
  }
  return false;
}

/**
 * Destructive iterator that sequentially shifts items from the buffer until empty.
 *
 * @template T - Stored element type.
 * @param state - Mutable ring buffer state.
 * @param metrics - Buffer telemetry metrics tracker.
 * @returns Iterator yielding elements while draining the buffer.
 */
export function drainRing<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
): IterableIterator<T> {
  return {
    next(): IteratorResult<T> {
      if (state.count === 0) return { done: true, value: undefined };
      const val = shiftItem(state, metrics);
      return val !== undefined ? { done: false, value: val } : { done: true, value: undefined };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}


