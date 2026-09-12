/**
 * Result Monad and Safe Constructor Factories for Bounded Ring Buffers.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferResult
 */

import { Ok, Err, type Result } from '../result';
import { isArray, isIterable, isRingBufferOptions, isValidBufferCapacity } from './bufferGuards';
import { createInvalidCapacityError, type BufferDomainError } from './bufferErrors';
import type { RingBufferOptions } from './bufferTypes';
import type { RingBuffer } from './ringBufferCore';

export type { BufferDomainError } from './bufferErrors';

export type BufferFactory<T> = (
  opt: number | RingBufferOptions<T>,
  onEvict?: (item: T) => void,
) => RingBuffer<T>;

export function createRingBufferSafe<T>(
  opt: number | RingBufferOptions<T>,
  onEvict?: (item: T) => void,
  factory?: BufferFactory<T>,
): Result<RingBuffer<T>, BufferDomainError> {
  const rawCap = isRingBufferOptions(opt) ? opt.capacity : opt;
  if (!isValidBufferCapacity(rawCap)) {
    return Err(createInvalidCapacityError(rawCap));
  }
  if (!factory) {
    return Err(createInvalidCapacityError(rawCap, 'Buffer factory function was not provided'));
  }
  try {
    return Ok(factory(opt, onEvict));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return Err(createInvalidCapacityError(rawCap, msg));
  }
}

export function createRingBufferFromSafe<T>(
  items: Iterable<T>,
  capacity?: number,
  factory?: BufferFactory<T>,
): Result<RingBuffer<T>, BufferDomainError> {
  if (!isIterable(items)) {
    return Err(createInvalidCapacityError(capacity ?? 0, 'Provided items source is not iterable'));
  }
  const arr = isArray(items) ? items : [...items];
  const targetCap = capacity ?? Math.max(16, arr.length);
  return createRingBufferSafe<T>({ capacity: targetCap, initialItems: arr }, undefined, factory);
}
