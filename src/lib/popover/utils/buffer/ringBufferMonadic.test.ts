/**
 * Monadic Result-Oriented Operations Unit Tests for RingBuffer.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/ringBufferMonadic.test
 */

import { describe, it, expect } from 'vitest';
import { RingBuffer } from './ringBufferCore';
import { isOk, isErr } from '../result';
import { isBufferEmptyError, isBufferOverflowError, isIndexOutOfBoundsError } from './bufferErrors';

describe('RingBuffer Monadic Result-Oriented Operations', () => {
  it('handles peekResult on empty vs populated buffers', () => {
    const ring = new RingBuffer<string>(3);
    const emptyRes = ring.peekResult();
    expect(isErr(emptyRes)).toBe(true);
    if (isErr(emptyRes)) {
      expect(isBufferEmptyError(emptyRes.error)).toBe(true);
    }

    ring.push('alpha');
    const peekRes = ring.peekResult();
    expect(isOk(peekRes)).toBe(true);
    if (isOk(peekRes)) {
      expect(peekRes.data).toBe('alpha');
    }
  });

  it('disambiguates stored undefined values from empty errors in popResult', () => {
    const ring = new RingBuffer<string | undefined>(2);
    ring.push(undefined);

    const res = ring.popResult();
    expect(isOk(res)).toBe(true);
    if (isOk(res)) {
      expect(res.data).toBeUndefined();
    }

    const emptyRes = ring.popResult();
    expect(isErr(emptyRes)).toBe(true);
    if (isErr(emptyRes)) {
      expect(isBufferEmptyError(emptyRes.error)).toBe(true);
    }
  });

  it('disambiguates atResult relative indexing and bounds', () => {
    const ring = new RingBuffer<number>(3);
    ring.push(10);
    ring.push(20);

    const validFirst = ring.atResult(0);
    expect(isOk(validFirst) && validFirst.data === 10).toBe(true);

    const validLast = ring.atResult(-1);
    expect(isOk(validLast) && validLast.data === 20).toBe(true);

    const oob = ring.atResult(5);
    expect(isErr(oob)).toBe(true);
    if (isErr(oob)) {
      expect(isIndexOutOfBoundsError(oob.error)).toBe(true);
      expect(oob.error.index).toBe(5);
      expect(oob.error.size).toBe(2);
    }
  });

  it('enforces non-evicting capacity boundaries in tryPush and tryUnshift', () => {
    const ring = new RingBuffer<number>({ capacity: 2, autoExpand: false });
    expect(isOk(ring.tryPush(1))).toBe(true);
    expect(isOk(ring.tryPush(2))).toBe(true);

    const overflowPush = ring.tryPush(3);
    expect(isErr(overflowPush)).toBe(true);
    if (isErr(overflowPush)) {
      expect(isBufferOverflowError(overflowPush.error)).toBe(true);
      expect(overflowPush.error.capacity).toBe(2);
    }
    expect(ring.toArray()).toEqual([1, 2]);

    const shiftRes = ring.shiftResult();
    expect(isOk(shiftRes) && shiftRes.data === 1).toBe(true);
    expect(isOk(ring.tryUnshift(99))).toBe(true);
    expect(ring.toArray()).toEqual([99, 2]);
  });
});
