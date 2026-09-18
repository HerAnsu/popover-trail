import { describe, it, expect } from 'vitest';
import { RingBuffer } from './ringBufferCore';
import { isOk, isErr } from '../result';
import {
  isBufferDomainError,
  isInvalidCapacityError,
  isBufferOverflowError,
  isBufferEmptyError,
  isIndexOutOfBoundsError,
  createBufferOverflowError,
  createBufferEmptyError,
  createIndexOutOfBoundsError,
  matchBufferError,
} from './bufferErrors';

describe('RingBuffer Safe Result-Monad Factories', () => {
  it('creates RingBuffer successfully with valid configuration', () => {
    const res = RingBuffer.create<number>(5);
    expect(isOk(res)).toBe(true);
    if (isOk(res)) {
      expect(res.data.capacity).toBe(5);
      expect(res.data.isEmpty).toBe(true);
    }
  });

  it('returns Err variant on invalid capacity without throwing exceptions', () => {
    const resZero = RingBuffer.create(0);
    expect(isErr(resZero)).toBe(true);
    if (isErr(resZero) && isInvalidCapacityError(resZero.error)) {
      expect(isBufferDomainError(resZero.error)).toBe(true);
      expect(resZero.error.code).toBe('INVALID_CAPACITY');
      expect(resZero.error.capacity).toBe(0);
    }

    const resNeg = RingBuffer.create(-10);
    expect(isErr(resNeg)).toBe(true);
    if (isErr(resNeg) && isInvalidCapacityError(resNeg.error)) {
      expect(resNeg.error.capacity).toBe(-10);
    }

    const resNaN = RingBuffer.create(Number.NaN);
    expect(isErr(resNaN)).toBe(true);
  });

  it('safely builds RingBuffer from iterable using RingBuffer.from', () => {
    const res = RingBuffer.from([10, 20, 30], 4);
    expect(isOk(res)).toBe(true);
    if (isOk(res)) {
      expect(res.data.capacity).toBe(4);
      expect(res.data.size).toBe(3);
      expect(res.data.toArray()).toEqual([10, 20, 30]);
    }
  });

  it('validates buffer error type guards and factory models', () => {
    const ofErr = createBufferOverflowError(10);
    expect(isBufferOverflowError(ofErr)).toBe(true);
    expect(isBufferDomainError(ofErr)).toBe(true);
    expect(isInvalidCapacityError(ofErr)).toBe(false);

    const emptyErr = createBufferEmptyError();
    expect(isBufferEmptyError(emptyErr)).toBe(true);
    expect(isBufferDomainError(emptyErr)).toBe(true);
    const oobErr = createIndexOutOfBoundsError(5, 2);
    expect(isIndexOutOfBoundsError(oobErr)).toBe(true);
    expect(isBufferDomainError(oobErr)).toBe(true);
    expect(isBufferDomainError(null)).toBe(false);
  });

  it('exhaustively matches domain errors via matchBufferError catamorphism', () => {
    const ofErr = createBufferOverflowError(16);
    const matched = matchBufferError(ofErr, {
      INVALID_CAPACITY: () => 'invalid',
      BUFFER_OVERFLOW: (e) => `overflow:${e.capacity}`,
      BUFFER_EMPTY: () => 'empty',
      INDEX_OUT_OF_BOUNDS: (e) => `oob:${e.index}:${e.size}`,
    });
    expect(matched).toBe('overflow:16');
  });
});
