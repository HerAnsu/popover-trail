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

export function findIndexInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): BufferLogicalIndex | -1 {
  return searchIndex(state, pred, false);
}

export function findLastIndexInRing<T>(
  state: ReadonlyRingBufferState<T>,
  pred: BufferPredicate<T>,
): BufferLogicalIndex | -1 {
  return searchIndex(state, pred, true);
}

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
