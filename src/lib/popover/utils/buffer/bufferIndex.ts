/**
 * Bounded Ring Buffer Physical Index Math & Bitmask Fast-Path.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferIndex
 */

import {
  toPhysicalIndex,
  toBufferCapacity,
  type BufferPhysicalIndex,
  type BufferLogicalIndex,
  type BufferCapacity,
} from './bufferBranded';
import { isValidBufferCapacity } from './bufferGuards';
import type { ReadonlyRingBufferState } from './bufferTypes';

export function validateCapacity(capacity: BufferCapacity | number): BufferCapacity {
  if (!isValidBufferCapacity(capacity)) {
    throw new RangeError(`RingBuffer capacity must be positive, got: ${capacity}`);
  }
  return toBufferCapacity(capacity);
}

export function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

export function computePhysicalIndex(
  head: BufferPhysicalIndex | number,
  offset: BufferLogicalIndex | number,
  capacity: BufferCapacity | number,
  isPowerOf2: boolean,
  mask: number,
): BufferPhysicalIndex {
  const logical = head + offset;
  const raw = isPowerOf2 ? logical & mask : ((logical % capacity) + capacity) % capacity;
  return toPhysicalIndex(raw);
}

export function getPhysicalIndex<T = unknown>(
  state: ReadonlyRingBufferState<T>,
  offset: BufferLogicalIndex | number,
): BufferPhysicalIndex {
  return computePhysicalIndex(state.head, offset, state.capacity, state.isPowerOf2, state.mask);
}

export function getBufferItem<T>(
  state: ReadonlyRingBufferState<T>,
  offset: BufferLogicalIndex | number,
): T | undefined {
  return state.buffer[getPhysicalIndex(state, offset)];
}
