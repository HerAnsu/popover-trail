/**
 * Value Search, Predicates, and Reductions for Bounded Ring Buffers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferSearch
 */

import { getBufferItem } from './bufferIndex';
import { toLogicalIndex, type BufferLogicalIndex, type BufferRelativeIndex } from './bufferBranded';
import type { ReadonlyRingBufferState } from './bufferStateTypes';

export * from './bufferFind';
export * from './bufferReduce';

export function indexOfInRing<T>(
  state: ReadonlyRingBufferState<T>,
  item: T,
  fromIndex: BufferRelativeIndex = 0,
): BufferLogicalIndex | -1 {
  const start = Math.max(0, fromIndex < 0 ? state.count + fromIndex : fromIndex);
  for (let i = start; i < state.count; i++) {
    const idx = toLogicalIndex(i);
    if (getBufferItem(state, idx) === item) return idx;
  }
  return -1;
}

export function lastIndexOfInRing<T>(
  state: ReadonlyRingBufferState<T>,
  item: T,
  fromIndex?: BufferRelativeIndex,
): BufferLogicalIndex | -1 {
  if (state.count === 0) return -1;
  const rawStart = fromIndex === undefined ? state.count - 1 : fromIndex;
  const start = rawStart < 0 ? state.count + rawStart : Math.min(rawStart, state.count - 1);
  for (let i = start; i >= 0; i--) {
    const idx = toLogicalIndex(i);
    if (getBufferItem(state, idx) === item) return idx;
  }
  return -1;
}

export function includesInRing<T>(
  state: ReadonlyRingBufferState<T>,
  item: T,
  fromIndex: BufferRelativeIndex = 0,
): boolean {
  return indexOfInRing(state, item, fromIndex) !== -1;
}
