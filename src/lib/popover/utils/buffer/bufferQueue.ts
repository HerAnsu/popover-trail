/**
 * Double-Ended Queue (Deque) Primitives for Bounded Ring Buffers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferQueue
 */

import { getPhysicalIndex } from './bufferIndex';
import { nextRevision, type BufferPhysicalIndex } from './bufferBranded';
import type { BufferMetricsTracker } from './bufferMetrics';
import type { RingBufferState } from './bufferTypes';

function maybeAutoExpand<T>(state: RingBufferState<T>, onResize?: (newCap: number) => void): void {
  if (state.count === state.capacity && state.autoExpand && state.capacity < state.maxCapacity) {
    onResize?.(Math.min(state.capacity * 2, state.maxCapacity));
  }
}

function evictSlot<T>(state: RingBufferState<T>, physicalIndex: BufferPhysicalIndex): void {
  const item = state.buffer[physicalIndex];
  if (state.onEvict && item !== undefined) state.onEvict(item);
}

export function pushItem<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
  item: T,
  onResize?: (newCap: number) => void,
): void {
  maybeAutoExpand(state, onResize);
  state.revision = nextRevision(state.revision);
  if (state.count === state.capacity) {
    evictSlot(state, state.head);
    state.buffer[state.head] = item;
    state.head = getPhysicalIndex(state, 1);
    metrics.recordPush(true, state.count);
    return;
  }
  const idx = getPhysicalIndex(state, state.count++);
  state.buffer[idx] = item;
  metrics.recordPush(false, state.count);
}

export function popItem<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
): T | undefined {
  if (state.count === 0) return undefined;
  state.revision = nextRevision(state.revision);
  const idx = getPhysicalIndex(state, --state.count);
  const item = state.buffer[idx];
  state.buffer[idx] = undefined;
  metrics.recordPop();
  return item;
}

export function shiftItem<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
): T | undefined {
  if (state.count === 0) return undefined;
  state.revision = nextRevision(state.revision);
  const item = state.buffer[state.head];
  state.buffer[state.head] = undefined;
  state.head = getPhysicalIndex(state, 1);
  state.count--;
  metrics.recordShift();
  return item;
}

export function unshiftItem<T>(
  state: RingBufferState<T>,
  metrics: BufferMetricsTracker,
  item: T,
  onResize?: (newCap: number) => void,
): void {
  maybeAutoExpand(state, onResize);
  state.revision = nextRevision(state.revision);
  state.head = getPhysicalIndex(state, -1);
  if (state.count === state.capacity) {
    evictSlot(state, getPhysicalIndex(state, state.count));
    state.buffer[state.head] = item;
    metrics.recordUnshift(true, state.count);
    return;
  }
  state.buffer[state.head] = item;
  state.count++;
  metrics.recordUnshift(false, state.count);
}
