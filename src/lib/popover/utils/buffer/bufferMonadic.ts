/**
 * Result-based operations for bounded ring buffers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferMonadic
 */

import { Ok, Err, type Result } from '../result';
import { getBufferItem } from './bufferIndex';
import { isLogicalIndex, toLogicalIndex, type BufferRelativeIndex } from './bufferBranded';
import { pushItem, popItem, shiftItem, unshiftItem } from './bufferQueue';
import type { BufferMetricsTracker } from './bufferMetrics';
import type { ReadonlyRingBufferState, RingBufferState } from './bufferStateTypes';
import {
  createBufferEmptyError,
  createIndexOutOfBoundsError,
  createBufferOverflowError,
  type BufferEmptyError,
  type IndexOutOfBoundsError,
  type BufferOverflowError,
} from './bufferErrors';

/**
 * Safely inspects the newest (last pushed) item in the ring buffer without mutating state.
 *
 * @template T - Buffer item type.
 * @param state - Internal ring buffer state.
 * @returns Ok with the newest item, or Err(BufferEmptyError) if buffer count is 0.
 */
export function peekRingResult<T>(state: ReadonlyRingBufferState<T>): Result<T, BufferEmptyError> {
  if (state.count === 0) return Err(createBufferEmptyError());
  const item = getBufferItem(state, toLogicalIndex(state.count - 1));
  return Ok(item as T);
}

/**
 * Safely inspects the oldest (first pushed) item in the ring buffer without mutating state.
 *
 * @template T - Buffer item type.
 * @param state - Internal ring buffer state.
 * @returns Ok with the oldest item, or Err(BufferEmptyError) if buffer count is 0.
 */
export function peekFirstRingResult<T>(
  state: ReadonlyRingBufferState<T>,
): Result<T, BufferEmptyError> {
  if (state.count === 0) return Err(createBufferEmptyError());
  const item = getBufferItem(state, toLogicalIndex(0));
  return Ok(item as T);
}

/**
 * Safely retrieves an item by logical or negative relative index without throwing.
 *
 * @remarks
 * Supports Python-style negative indices where `-1` represents the newest item (`count - 1`)
 * and `0` represents the oldest item (`0`).
 *
 * @template T - Buffer item type.
 * @param state - Internal ring buffer state.
 * @param relativeIndex - Relative integer offset.
 * @returns Ok with the item, or Err(IndexOutOfBoundsError) if the index exceeds active bounds.
 */
export function itemAtRingResult<T>(
  state: ReadonlyRingBufferState<T>,
  relativeIndex: BufferRelativeIndex,
): Result<T, IndexOutOfBoundsError> {
  // Normalize negative index offset relative to active item count
  const norm = relativeIndex < 0 ? state.count + relativeIndex : relativeIndex;
  if (!isLogicalIndex(norm) || norm >= state.count) {
    return Err(createIndexOutOfBoundsError(relativeIndex, state.count));
  }
  const item = getBufferItem(state, toLogicalIndex(norm));
  return Ok(item as T);
}

export function popRingResult<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
): Result<T, BufferEmptyError> {
  if (state.count === 0) return Err(createBufferEmptyError());
  return Ok(popItem(state, metrics) as T);
}

export function shiftRingResult<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
): Result<T, BufferEmptyError> {
  if (state.count === 0) return Err(createBufferEmptyError());
  return Ok(shiftItem(state, metrics) as T);
}

export function tryPushRing<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
  item: T,
  onResize?: (cap: number) => void,
): Result<void, BufferOverflowError> {
  if (
    state.count === state.capacity &&
    (!state.autoExpand || state.capacity >= state.maxCapacity)
  ) {
    return Err(createBufferOverflowError(state.capacity));
  }
  pushItem(state, metrics, item, onResize);
  return Ok(undefined);
}

export function tryUnshiftRing<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
  item: T,
  onResize?: (cap: number) => void,
): Result<void, BufferOverflowError> {
  if (
    state.count === state.capacity &&
    (!state.autoExpand || state.capacity >= state.maxCapacity)
  ) {
    return Err(createBufferOverflowError(state.capacity));
  }
  unshiftItem(state, metrics, item, onResize);
  return Ok(undefined);
}
