import { describe, it, expect } from 'vitest';
import { RingBuffer } from './ringBuffer';

describe('RingBuffer Core', () => {
  it('initializes correctly with positive capacity', () => {
    const ring = new RingBuffer<number>(3);
    expect(ring.capacity).toBe(3);
    expect(ring.size).toBe(0);
    expect(ring.isEmpty).toBe(true);
    expect(ring.isFull).toBe(false);
    expect(ring.toArray()).toEqual([]);
  });

  it('throws on non-positive or non-finite capacity', () => {
    expect(() => new RingBuffer(0)).toThrow(RangeError);
    expect(() => new RingBuffer(-1)).toThrow(RangeError);
    expect(() => new RingBuffer(Number.NaN)).toThrow(RangeError);
  });

  it('pushes and evicts oldest element on overflow (non-power of 2)', () => {
    const ring = new RingBuffer<string>(3);
    ring.push('a');
    ring.push('b');
    ring.push('c');
    expect(ring.isFull).toBe(true);
    expect(ring.toArray()).toEqual(['a', 'b', 'c']);
    expect(ring.toReversedArray()).toEqual(['c', 'b', 'a']);

    ring.push('d');
    expect(ring.size).toBe(3);
    expect(ring.toArray()).toEqual(['b', 'c', 'd']);
    expect(ring.toReversedArray()).toEqual(['d', 'c', 'b']);
    expect(ring.peek()).toBe('d');
  });

  it('supports power-of-2 fast-path bitmask indexing with multiple wraps', () => {
    const ring = new RingBuffer<number>(4);
    for (let i = 1; i <= 10; i++) ring.push(i);
    expect(ring.size).toBe(4);
    expect(ring.isFull).toBe(true);
    expect(ring.toArray()).toEqual([7, 8, 9, 10]);
    expect(ring.peek()).toBe(10);
    expect(ring.peekOldest()).toBe(7);
  });

  it('pops elements in LIFO order', () => {
    const ring = new RingBuffer<number>(3);
    ring.push(1);
    ring.push(2);
    expect(ring.pop()).toBe(2);
    expect(ring.size).toBe(1);
    expect(ring.pop()).toBe(1);
    expect(ring.pop()).toBeUndefined();
    expect(ring.isEmpty).toBe(true);
  });

  it('clears all elements properly', () => {
    const ring = new RingBuffer<number>(2);
    ring.push(10);
    ring.push(20);
    ring.clear();
    expect(ring.size).toBe(0);
    expect(ring.isEmpty).toBe(true);
    expect(ring.toArray()).toEqual([]);
  });

  it('supports RAII Symbol.dispose and clears buffer', () => {
    const ring = new RingBuffer<string>(3);
    ring.push('x');
    ring.push('y');
    expect(ring.size).toBe(2);

    ring.dispose();
    expect(ring.size).toBe(0);
    expect(ring.isEmpty).toBe(true);
  });
});
