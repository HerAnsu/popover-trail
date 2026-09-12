/**
 * Monadic Result Operations for Bounded Ring Buffers.
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

export function peekRingResult<T>(state: ReadonlyRingBufferState<T>): Result<T, BufferEmptyError> {
  if (state.count === 0) return Err(createBufferEmptyError());
  const item = getBufferItem(state, toLogicalIndex(state.count - 1));
  return Ok(item as T);
}

export function itemAtRingResult<T>(
  state: ReadonlyRingBufferState<T>,
  relativeIndex: BufferRelativeIndex,
): Result<T, IndexOutOfBoundsError> {
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
  if (state.count === state.capacity && (!state.autoExpand || state.capacity >= state.maxCapacity)) {
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
  if (state.count === state.capacity && (!state.autoExpand || state.capacity >= state.maxCapacity)) {
    return Err(createBufferOverflowError(state.capacity));
  }
  unshiftItem(state, metrics, item, onResize);
  return Ok(undefined);
}
