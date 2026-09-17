/**
 * Zero-Allocation Predicate Evaluation and Reductions for Bounded Ring Buffers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferReduce
 */

import { getBufferItem } from './bufferIndex';
import { toLogicalIndex } from './bufferBranded';
import { findIndexInRing } from './bufferFind';
import { forEachItem, forEachReversedItem } from './bufferIteration';
import type { BufferPredicate, BufferReducer, ReadonlyRingBufferState } from './bufferTypes';

/**
 * Tests whether at least one element in the ring buffer passes the predicate test.
 * Short-circuits immediately upon encountering a matching element.
 *
 * @template T - Stored item type.
 * @param state - Readonly ring buffer state.
 * @param pred - Predicate function tested against elements.
 * @returns `true` if any element matches; `false` otherwise.
 *
 * @example
 * ```ts
 * const hasPinned = someInRing(buffer.state, (card) => card.isPinned);
 * ```
 */
export function someInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): boolean {
  return findIndexInRing(state, pred) !== -1;
}

/**
 * Tests whether all elements in the ring buffer pass the predicate test.
 * Short-circuits immediately upon encountering the first non-matching element.
 *
 * @template T - Stored item type.
 * @param state - Readonly ring buffer state.
 * @param pred - Predicate function tested against elements.
 * @returns `true` if all elements match; `false` otherwise.
 *
 * @example
 * ```ts
 * const allMounted = everyInRing(buffer.state, (card) => card.mounted);
 * ```
 */
export function everyInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): boolean {
  for (let i = 0; i < state.count; i++) {
    const idx = toLogicalIndex(i);
    const item = getBufferItem(state, idx);
    if (item === undefined || !pred(item, idx)) return false;
  }
  return true;
}

/**
 * Executes a reducer callback on each element in the ring buffer in chronological order (head to tail).
 *
 * @template T - Stored item type.
 * @template U - Accumulated accumulator type.
 * @param state - Readonly ring buffer state.
 * @param reducer - Reducer callback function `(acc, item, index) => nextAcc`.
 * @param initial - Initial seed accumulator value.
 * @returns The final accumulated value.
 *
 * @example
 * ```ts
 * const totalWeight = reduceInRing(buffer.state, (sum, entry) => sum + entry.weight, 0);
 * ```
 */
export function reduceInRing<T, U>(
  state: ReadonlyRingBufferState<T>,
  reducer: BufferReducer<T, U>,
  initial: U,
): U {
  let acc = initial;
  forEachItem(state, (item, i) => {
    acc = reducer(acc, item, i);
  });
  return acc;
}

/**
 * Executes a reducer callback on each element in the ring buffer in reverse chronological order (tail to head).
 *
 * @template T - Stored item type.
 * @template U - Accumulated accumulator type.
 * @param state - Readonly ring buffer state.
 * @param reducer - Reducer callback function `(acc, item, index) => nextAcc`.
 * @param initial - Initial seed accumulator value.
 * @returns The final accumulated value.
 *
 * @example
 * ```ts
 * const latestSummary = reduceRightInRing(buffer.state, (acc, item) => `${acc}, ${item.id}`, '');
 * ```
 */
export function reduceRightInRing<T, U>(
  state: ReadonlyRingBufferState<T>,
  reducer: BufferReducer<T, U>,
  initial: U,
): U {
  let acc = initial;
  forEachReversedItem(state, (item, i) => {
    acc = reducer(acc, item, i);
  });
  return acc;
}
