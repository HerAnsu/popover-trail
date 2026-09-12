/**
 * Buffer Slicing, Bulk Copying, and Resizing Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferSlice
 */

import { getBufferItem, validateCapacity, isPowerOfTwo } from './bufferIndex';
import {
  toPhysicalIndex,
  toLogicalIndex,
  nextRevision,
  type BufferCapacity,
  type BufferRelativeIndex,
} from './bufferBranded';
import { isArray } from './bufferGuards';
import { forEachItem } from './bufferIteration';
import { evictBufferItems } from './bufferState';
import type { RingBufferOptions, RingBufferState, ReadonlyRingBufferState } from './bufferTypes';
import type { RingBuffer } from './ringBufferCore';

export function sliceRing<T>(
  state: ReadonlyRingBufferState<T>,
  start: BufferRelativeIndex = 0,
  end: BufferRelativeIndex = state.count,
): T[] {
  let s = start < 0 ? Math.max(0, state.count + start) : Math.min(state.count, start);
  const e = countBound(state.count, end);
  if (s >= e) return [];
  const res: T[] = [];
  while (s < e) {
    const item = getBufferItem(state, toLogicalIndex(s++));
    if (item !== undefined) res.push(item);
  }
  return res;
}

function countBound(count: number, end: number): number {
  return end < 0 ? Math.max(0, count + end) : Math.min(count, end);
}

export function copyRingTo<T>(
  state: ReadonlyRingBufferState<T>,
  target: (T | undefined)[],
  targetOffset: BufferRelativeIndex = 0,
): number {
  if (!isArray(target)) return 0;
  const n = Math.min(state.count, target.length - targetOffset);
  for (let i = 0; i < n; i++) {
    target[targetOffset + i] = getBufferItem(state, toLogicalIndex(i));
  }
  return n;
}

export function cloneRing<T>(
  state: ReadonlyRingBufferState<T>,
  createBuffer: (opt: RingBufferOptions<T>) => RingBuffer<T>,
): RingBuffer<T> {
  const { capacity, onEvict, autoExpand, maxCapacity } = state;
  const c = createBuffer({ capacity, onEvict, autoExpand, maxCapacity });
  forEachItem(state, (item) => c.push(item));
  return c;
}

export function resizeRing<T>(
  state: RingBufferState<T>,
  newCapacity: BufferCapacity | number,
): void {
  const newCap = validateCapacity(newCapacity);
  const newBuf = Array.from<T | undefined>({ length: newCap });
  let copyCount = state.count;
  let startOffset = 0;
  if (newCap < state.count) {
    const evictCount = state.count - newCap;
    evictBufferItems(state, evictCount);
    copyCount = newCap;
    startOffset = evictCount;
  }
  for (let i = 0; i < copyCount; i++) {
    newBuf[i] = getBufferItem(state, toLogicalIndex(startOffset + i));
  }
  state.buffer = newBuf;
  state.head = toPhysicalIndex(0);
  state.count = copyCount;
  state.capacity = newCap;
  state.isPowerOf2 = isPowerOfTwo(newCap);
  state.mask = newCap - 1;
  state.revision = nextRevision(state.revision);
}

export function shrinkRingToFit<T>(state: RingBufferState<T>): void {
  if (state.capacity > state.count) resizeRing(state, Math.max(1, state.count));
}
