/**
 * Zero-Allocation Search and Index Lookup Algorithms for Bounded Ring Buffers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferFind
 */

import { getBufferItem } from './bufferIndex';
import { toLogicalIndex, type BufferLogicalIndex } from './bufferBranded';
import type { BufferPredicate, BufferTypeGuard, ReadonlyRingBufferState } from './bufferTypes';

function searchIndex<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
  fromEnd: boolean,
): BufferLogicalIndex | -1 {
  const start = fromEnd ? state.count - 1 : 0;
  const end = fromEnd ? -1 : state.count;
  const step = fromEnd ? -1 : 1;
  for (let i = start; i !== end; i += step) {
    const idx = toLogicalIndex(i);
    const item = getBufferItem(state, idx);
    if (item !== undefined && pred(item, idx)) return idx;
  }
  return -1;
}

/**
 * Searches the ring buffer from head to tail for the first element satisfying a predicate.
 *
 * @template T - Stored item type.
 * @param state - Readonly ring buffer state.
 * @param pred - Predicate function tested against each element.
 * @returns Logical index of the first match, or `-1` if none found.
 *
 * @example
 * ```ts
 * const idx = findIndexInRing(buffer.state, (entry) => entry.key === 'card-1');
 * ```
 */
export function findIndexInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): BufferLogicalIndex | -1 {
  return searchIndex(state, pred, false);
}

/**
 * Searches the ring buffer backwards from tail to head for the first element satisfying a predicate.
 *
 * @template T - Stored item type.
 * @param state - Readonly ring buffer state.
 * @param pred - Predicate function tested against each element.
 * @returns Logical index of the last match, or `-1` if none found.
 *
 * @example
 * ```ts
 * const idx = findLastIndexInRing(buffer.state, (entry) => entry.isPinned);
 * ```
 */
export function findLastIndexInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): BufferLogicalIndex | -1 {
  return searchIndex(state, pred, true);
}

/**
 * Finds the first item in the ring buffer satisfying a type guard or predicate.
 *
 * @template T - Stored item type.
 * @template S - Narrowed subtype.
 * @param state - Readonly ring buffer state.
 * @param pred - Predicate or type guard function.
 * @returns The matching item, or `undefined` if none found.
 *
 * @example
 * ```ts
 * const item = findInRing(buffer.state, (item) => item.score > 10);
 * ```
 */
export function findInRing<T, S extends T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferTypeGuard<T, S>,
): S | undefined;
export function findInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): T | undefined;
export function findInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): T | undefined {
  const idx = findIndexInRing(state, pred);
  return idx === -1 ? undefined : getBufferItem(state, idx);
}

/**
 * Finds the last item in the ring buffer satisfying a type guard or predicate.
 *
 * @template T - Stored item type.
 * @template S - Narrowed subtype.
 * @param state - Readonly ring buffer state.
 * @param pred - Predicate or type guard function.
 * @returns The matching item, or `undefined` if none found.
 *
 * @example
 * ```ts
 * const item = findLastInRing(buffer.state, (item) => item.active);
 * ```
 */
export function findLastInRing<T, S extends T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferTypeGuard<T, S>,
): S | undefined;
export function findLastInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): T | undefined;
export function findLastInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): T | undefined {
  const idx = findLastIndexInRing(state, pred);
  return idx === -1 ? undefined : getBufferItem(state, idx);
}

/**
 * Counts the number of elements in the ring buffer satisfying a predicate.
 *
 * @template T - Stored item type.
 * @param state - Readonly ring buffer state.
 * @param pred - Predicate function tested against each element.
 * @returns Number of matching elements.
 */
export function countInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): number {
  let matched = 0;
  for (let i = 0; i < state.count; i++) {
    const idx = toLogicalIndex(i);
    const item = getBufferItem(state, idx);
    if (item !== undefined && pred(item, idx)) {
      matched++;
    }
  }
  return matched;
}

/**
 * Returns the first `n` logical items from the buffer as an array.
 *
 * @template T - Stored item type.
 * @param state - Readonly ring buffer state.
 * @param n - Count of items to take.
 * @returns Array containing up to `n` elements from the head.
 */
export function takeFromRing<T>(
  state: ReadonlyRingBufferState<T>,
  n: number,
): T[] {
  const limit = Math.min(Math.max(0, n), state.count);
  const res: T[] = [];
  for (let i = 0; i < limit; i++) {
    const item = getBufferItem(state, toLogicalIndex(i));
    if (item !== undefined) res.push(item);
  }
  return res;
}

/**
 * Returns the last `n` logical items from the buffer as an array.
 *
 * @template T - Stored item type.
 * @param state - Readonly ring buffer state.
 * @param n - Count of items to take from the tail.
 * @returns Array containing up to `n` elements from the tail.
 */
export function takeLastFromRing<T>(
  state: ReadonlyRingBufferState<T>,
  n: number,
): T[] {
  const limit = Math.min(Math.max(0, n), state.count);
  const start = state.count - limit;
  const res: T[] = [];
  for (let i = start; i < state.count; i++) {
    const item = getBufferItem(state, toLogicalIndex(i));
    if (item !== undefined) res.push(item);
  }
  return res;
}

