/**
 * Zero-Allocation In-Place Mutation Primitives for Bounded Ring Buffers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferMutation
 */

import { getPhysicalIndex } from './bufferIndex';
import { isLogicalIndex, nextRevision, type BufferRelativeIndex } from './bufferBranded';
import type { RingBufferState } from './bufferStateTypes';

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
