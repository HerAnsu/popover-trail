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

export function someInRing<T>(state: ReadonlyRingBufferState<T>, pred: BufferPredicate<T>): boolean {
  return findIndexInRing(state, pred) !== -1;
}

export function everyInRing<T>(state: ReadonlyRingBufferState<T>, pred: BufferPredicate<T>): boolean {
  for (let i = 0; i < state.count; i++) {
    const idx = toLogicalIndex(i);
    const item = getBufferItem(state, idx);
    if (item === undefined || !pred(item, idx)) return false;
  }
  return true;
}

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
