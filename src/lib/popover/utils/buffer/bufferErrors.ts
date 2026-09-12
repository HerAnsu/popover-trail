/**
 * Domain Error Model, Type Guards, and Factory Helpers for RingBuffer.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferErrors
 */

import { assertNever } from '../assertNever';

export interface InvalidCapacityError {
  readonly code: 'INVALID_CAPACITY';
  readonly message: string;
  readonly capacity: number;
}
export interface BufferOverflowError {
  readonly code: 'BUFFER_OVERFLOW';
  readonly message: string;
  readonly capacity: number;
}
export interface BufferEmptyError {
  readonly code: 'BUFFER_EMPTY';
  readonly message: string;
}
export interface IndexOutOfBoundsError {
  readonly code: 'INDEX_OUT_OF_BOUNDS';
  readonly message: string;
  readonly index: number;
  readonly size: number;
}

export type BufferDomainError =
  | InvalidCapacityError
  | BufferOverflowError
  | BufferEmptyError
  | IndexOutOfBoundsError;
export type BufferDomainErrorCode = BufferDomainError['code'];

export function isBufferDomainError(val: unknown): val is BufferDomainError {
  if (typeof val !== 'object' || val === null || !('code' in val)) return false;
  const c = val.code;
  return (
    c === 'INVALID_CAPACITY' ||
    c === 'BUFFER_OVERFLOW' ||
    c === 'BUFFER_EMPTY' ||
    c === 'INDEX_OUT_OF_BOUNDS'
  );
}
export function isInvalidCapacityError(val: unknown): val is InvalidCapacityError {
  return (
    typeof val === 'object' && val !== null && 'code' in val && val.code === 'INVALID_CAPACITY'
  );
}
export function isBufferOverflowError(val: unknown): val is BufferOverflowError {
  return typeof val === 'object' && val !== null && 'code' in val && val.code === 'BUFFER_OVERFLOW';
}
export function isBufferEmptyError(val: unknown): val is BufferEmptyError {
  return typeof val === 'object' && val !== null && 'code' in val && val.code === 'BUFFER_EMPTY';
}
export function isIndexOutOfBoundsError(val: unknown): val is IndexOutOfBoundsError {
  return (
    typeof val === 'object' && val !== null && 'code' in val && val.code === 'INDEX_OUT_OF_BOUNDS'
  );
}

export function matchBufferError<R>(
  err: BufferDomainError,
  cases: {
    INVALID_CAPACITY: (e: InvalidCapacityError) => R;
    BUFFER_OVERFLOW: (e: BufferOverflowError) => R;
    BUFFER_EMPTY: (e: BufferEmptyError) => R;
    INDEX_OUT_OF_BOUNDS: (e: IndexOutOfBoundsError) => R;
  },
): R {
  switch (err.code) {
    case 'INVALID_CAPACITY':
      return cases.INVALID_CAPACITY(err);
    case 'BUFFER_OVERFLOW':
      return cases.BUFFER_OVERFLOW(err);
    case 'BUFFER_EMPTY':
      return cases.BUFFER_EMPTY(err);
    case 'INDEX_OUT_OF_BOUNDS':
      return cases.INDEX_OUT_OF_BOUNDS(err);
    default:
      return assertNever(err);
  }
}

export function createInvalidCapacityError(cap: unknown, msg?: string): InvalidCapacityError {
  const message = msg ?? `RingBuffer capacity must be positive finite number, got: ${String(cap)}`;
  return {
    code: 'INVALID_CAPACITY',
    message,
    capacity: typeof cap === 'number' ? cap : Number.NaN,
  };
}
export function createBufferOverflowError(cap: number, msg?: string): BufferOverflowError {
  return {
    code: 'BUFFER_OVERFLOW',
    message: msg ?? `RingBuffer capacity limit (${cap}) exceeded`,
    capacity: cap,
  };
}
export function createBufferEmptyError(msg?: string): BufferEmptyError {
  return { code: 'BUFFER_EMPTY', message: msg ?? 'Operation invalid on empty RingBuffer' };
}
export function createIndexOutOfBoundsError(
  idx: number,
  size: number,
  msg?: string,
): IndexOutOfBoundsError {
  return {
    code: 'INDEX_OUT_OF_BOUNDS',
    message: msg ?? `Index ${idx} is out of bounds for buffer size ${size}`,
    index: idx,
    size,
  };
}
