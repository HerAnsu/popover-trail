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

  it('supports fluent method chaining', () => {
    const ring = new RingBuffer<string>(5);
    ring.push('step-1').push('step-2').push('step-3');
    expect(ring.toArray()).toEqual(['step-1', 'step-2', 'step-3']);
  });

  it('provides first and last getters matching oldest and newest elements', () => {
    const ring = new RingBuffer<string>(4);
    expect(ring.first).toBeUndefined();
    expect(ring.last).toBeUndefined();

    ring.push('first-item').push('middle').push('last-item');
    expect(ring.first).toBe('first-item');
    expect(ring.last).toBe('last-item');
  });

  it('iterates backwards from newest to oldest via valuesReversed', () => {
    const ring = new RingBuffer<number>(5);
    ring.push(10).push(20).push(30);

    const reversed = [...ring.valuesReversed()];
    expect(reversed).toEqual([30, 20, 10]);
  });

  it('serializes cleanly into JSON array via toJSON', () => {
    const ring = new RingBuffer<string>(3);
    ring.push('alpha').push('beta');

    expect(JSON.stringify(ring)).toBe('["alpha","beta"]');
  });

  it('removes elements in-place with remove and removeAt', () => {
    const ring = new RingBuffer<string>(5);
    ring.push('a').push('b').push('c').push('d');

    // remove by item
    const removedB = ring.remove('b');
    expect(removedB).toBe(true);
    expect(ring.toArray()).toEqual(['a', 'c', 'd']);

    // remove by relative index (-1 = last element)
    const removedD = ring.removeAt(-1);
    expect(removedD).toBe('d');
    expect(ring.toArray()).toEqual(['a', 'c']);

    // remove non-existent
    expect(ring.remove('non-existent')).toBe(false);
    expect(ring.removeAt(10)).toBeUndefined();
  });
});

