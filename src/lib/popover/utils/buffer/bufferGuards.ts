/**
 * Type Guards and Validators for Bounded Ring Buffers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferGuards
 */
import { isPositiveFinite } from '../guards/numberGuards';
import { isArray, isIterable } from '../guards/arrayGuards';
import { isPhysicalIndex, isBufferRevision, type BufferCapacity } from './bufferBranded';
import type { RingBufferOptions, RingBufferState, ReadonlyRingBuffer } from './bufferTypes';
import type { RingBuffer } from './ringBufferCore';

/** Validates whether a value is a valid positive finite buffer capacity integer. */
export function isValidBufferCapacity(val: unknown): val is BufferCapacity {
  return isPositiveFinite(val) && val > 0;
}

/** Checks whether an unknown value is a valid RingBufferOptions object. */
export function isRingBufferOptions<T = unknown>(val: unknown): val is RingBufferOptions<T> {
  return (
    typeof val === 'object' &&
    val !== null &&
    !isArray(val) &&
    'capacity' in val &&
    isValidBufferCapacity(val.capacity)
  );
}

/**
 * Checks whether an unknown object adheres to the ReadonlyRingBuffer interface.
 */
export function isReadonlyRingBuffer<T = unknown>(val: unknown): val is ReadonlyRingBuffer<T> {
  if (typeof val !== 'object' || val === null) return false;
  return (
    'capacity' in val && typeof val.capacity === 'number' &&
    'size' in val && typeof val.size === 'number' &&
    'revision' in val && isBufferRevision(val.revision) &&
    'peek' in val && typeof val.peek === 'function' &&
    'at' in val && typeof val.at === 'function' &&
    'forEach' in val && typeof val.forEach === 'function' &&
    'toArray' in val && typeof val.toArray === 'function'
  );
}

export function isRingBuffer<T = unknown>(val: unknown): val is RingBuffer<T> {
  if (!isReadonlyRingBuffer<T>(val)) return false;
  return (
    'push' in val && typeof val.push === 'function' &&
    'pop' in val && typeof val.pop === 'function' &&
    'shift' in val && typeof val.shift === 'function' &&
    'clear' in val && typeof val.clear === 'function' &&
    'resize' in val && typeof val.resize === 'function'
  );
}

/** Validates whether an unknown value conforms to internal RingBufferState shape. */
export function isRingBufferState<T = unknown>(val: unknown): val is RingBufferState<T> {
  if (typeof val !== 'object' || val === null) return false;
  return (
    'buffer' in val && isArray(val.buffer) &&
    'head' in val && isPhysicalIndex(val.head) &&
    'count' in val && typeof val.count === 'number' &&
    'capacity' in val && typeof val.capacity === 'number' &&
    'revision' in val && isBufferRevision(val.revision)
  );
}

export function isBufferEmpty(target: { readonly count: number } | { readonly size: number }): boolean {
  return 'size' in target ? target.size === 0 : target.count === 0;
}

export function isBufferFull(
  target: { readonly count: number; readonly capacity: number } | { readonly size: number; readonly capacity: number },
): boolean {
  return 'size' in target ? target.size === target.capacity : target.count === target.capacity;
}

export { isIterable, isArray };
