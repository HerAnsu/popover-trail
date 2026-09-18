import { describe, it, expect } from 'vitest';
import {
  isValidBufferCapacity,
  isRingBufferOptions,
  isReadonlyRingBuffer,
  isRingBuffer,
  isRingBufferState,
  isBufferEmpty,
  isBufferFull,
  isArray,
  isIterable,
} from './bufferGuards';
import { RingBuffer } from './ringBufferCore';

describe('bufferGuards', () => {
  it('validates buffer capacity integers', () => {
    expect(isValidBufferCapacity(10)).toBe(true);
    expect(isValidBufferCapacity(1)).toBe(true);
    expect(isValidBufferCapacity(0)).toBe(false);
    expect(isValidBufferCapacity(-5)).toBe(false);
    expect(isValidBufferCapacity(Number.NaN)).toBe(false);
    expect(isValidBufferCapacity(Infinity)).toBe(false);
    expect(isValidBufferCapacity('10')).toBe(false);
    expect(isValidBufferCapacity(null)).toBe(false);
  });

  it('validates RingBufferOptions structure', () => {
    expect(isRingBufferOptions({ capacity: 16 })).toBe(true);
    expect(isRingBufferOptions({ capacity: 16, autoExpand: true })).toBe(true);
    expect(isRingBufferOptions({ capacity: 0 })).toBe(false);
    expect(isRingBufferOptions({ capacity: -1 })).toBe(false);
    expect(isRingBufferOptions({})).toBe(false);
    expect(isRingBufferOptions(16)).toBe(false);
    expect(isRingBufferOptions(null)).toBe(false);
    expect(isRingBufferOptions([16])).toBe(false);
  });

  it('identifies ReadonlyRingBuffer and RingBuffer instances', () => {
    const buf = new RingBuffer<number>(4);
    expect(isRingBuffer(buf)).toBe(true);
    expect(isReadonlyRingBuffer(buf)).toBe(true);

    const fakeReadonly = {
      capacity: 4,
      size: 0,
      revision: 0,
      peek: () => undefined,
      at: () => undefined,
      forEach: () => {},
      toArray: () => [],
    };
    expect(isReadonlyRingBuffer(fakeReadonly)).toBe(true);
    expect(isRingBuffer(fakeReadonly)).toBe(false);
    expect(isRingBuffer(null)).toBe(false);
    expect(isRingBuffer({})).toBe(false);
  });

  it('validates isBufferEmpty and isBufferFull predicates', () => {
    const buf = new RingBuffer<number>(2);
    expect(isBufferEmpty(buf)).toBe(true);
    expect(isBufferFull(buf)).toBe(false);

    buf.push(1);
    expect(isBufferEmpty(buf)).toBe(false);
    expect(isBufferFull(buf)).toBe(false);

    buf.push(2);
    expect(isBufferEmpty(buf)).toBe(false);
    expect(isBufferFull(buf)).toBe(true);
  });

  it('validates array and iterable guards re-exported from bufferGuards', () => {
    expect(isArray([1, 2, 3])).toBe(true);
    expect(isArray('string')).toBe(false);
    expect(isIterable([1, 2])).toBe(true);
    expect(isIterable(new Set([1]))).toBe(true);
    expect(isIterable({})).toBe(false);
  });

  it('validates isRingBufferState conforming shapes', () => {
    const validState = { buffer: [1, 2, 3], head: 0, count: 3, capacity: 3, revision: 1 };
    expect(isRingBufferState(validState)).toBe(true);
    expect(isRingBufferState(null)).toBe(false);
    expect(isRingBufferState({ buffer: 'not-array' })).toBe(false);
    expect(isRingBufferState({})).toBe(false);
  });
});
