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
import { clamp } from '../math';

/**
 * Extracts a shallow array slice of elements from the ring buffer between `start` and `end`.
 * Supports negative relative indices (e.g. `-1` refers to the last element).
 *
 * @template T - Stored item type.
 * @param state - Readonly ring buffer state.
 * @param start - Starting relative logical index (inclusive, defaults to 0).
 * @param end - Ending relative logical index (exclusive, defaults to state.count).
 * @returns An array containing the sliced elements in FIFO order.
 *
 * @example
 * ```ts
 * const recent = sliceRing(buffer.state, -5); // last 5 items
 * ```
 */
export function sliceRing<T>(
  state: ReadonlyRingBufferState<T>,
  start: BufferRelativeIndex = 0,
  end: BufferRelativeIndex = state.count,
): T[] {
  let s = clamp(start < 0 ? state.count + start : start, 0, state.count);
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
  return clamp(end < 0 ? count + end : end, 0, count);
}

/**
 * Copies elements from the ring buffer into a target array starting at `targetOffset`.
 *
 * @template T - Stored item type.
 * @param state - Readonly ring buffer state.
 * @param target - Destination array.
 * @param targetOffset - Offset index within target array to begin copying (default: 0).
 * @returns Total number of elements successfully copied.
 *
 * @example
 * ```ts
 * const target = new Array(10);
 * const copied = copyRingTo(buffer.state, target, 0);
 * ```
 */
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

/**
 * Creates an independent clone of the ring buffer preserving options and contents.
 *
 * @template T - Stored item type.
 * @param state - Readonly ring buffer state to clone.
 * @param createBuffer - Factory callback to instantiate the new buffer instance.
 * @returns A new cloned RingBuffer instance.
 *
 * @example
 * ```ts
 * const cloned = cloneRing(buffer.state, (opts) => new RingBuffer(opts));
 * ```
 */
export function cloneRing<T>(
  state: ReadonlyRingBufferState<T>,
  createBuffer: (opt: RingBufferOptions<T>) => RingBuffer<T>,
): RingBuffer<T> {
  const { capacity, onEvict, autoExpand, maxCapacity } = state;
  const c = createBuffer({ capacity, onEvict, autoExpand, maxCapacity });
  forEachItem(state, (item) => c.push(item));
  return c;
}

/**
 * Resizes the underlying buffer array to a new capacity.
 * If the new capacity is smaller than current item count, oldest elements are evicted.
 *
 * @template T - Stored item type.
 * @param state - Mutable ring buffer state.
 * @param newCapacity - New capacity integer.
 *
 * @example
 * ```ts
 * resizeRing(buffer.state, 128);
 * ```
 */
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

/**
 * Shrinks the buffer capacity to match the current count of elements, freeing unused array slots.
 *
 * @template T - Stored item type.
 * @param state - Mutable ring buffer state.
 *
 * @example
 * ```ts
 * shrinkRingToFit(buffer.state);
 * ```
 */
export function shrinkRingToFit<T>(state: RingBufferState<T>): void {
  if (state.capacity > state.count) resizeRing(state, Math.max(1, state.count));
}
