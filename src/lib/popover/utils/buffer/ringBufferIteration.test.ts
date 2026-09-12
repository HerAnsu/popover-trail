import { describe, it, expect } from 'vitest';
import { RingBuffer } from './ringBufferCore';

describe('RingBuffer Iteration & Traversal', () => {
  it('supports zero-allocation forEach and forEachReversed', () => {
    const ring = new RingBuffer<string>(3);
    ring.pushMany(['a', 'b', 'c']);
    const forward: [string, number][] = [];
    const reversed: [string, number][] = [];

    ring.forEach((item, idx) => forward.push([item, idx]));
    ring.forEachReversed((item, idx) => reversed.push([item, idx]));

    expect(forward).toEqual([
      ['a', 0],
      ['b', 1],
      ['c', 2],
    ]);
    expect(reversed).toEqual([
      ['c', 0],
      ['b', 1],
      ['a', 2],
    ]);
  });

  it('supports relative indexing with at() including negative indices', () => {
    const ring = new RingBuffer<number>(4);
    ring.pushMany([10, 20, 30]);

    expect(ring.at(0)).toBe(10);
    expect(ring.at(1)).toBe(20);
    expect(ring.at(2)).toBe(30);
    expect(ring.at(-1)).toBe(30);
    expect(ring.at(-2)).toBe(20);
    expect(ring.at(-3)).toBe(10);
    expect(ring.at(3)).toBeUndefined();
    expect(ring.at(-4)).toBeUndefined();
  });

  it('implements standard ES6 Iterable protocol', () => {
    const ring = new RingBuffer<number>(4);
    ring.pushMany([1, 2, 3]);

    const collected: number[] = [];
    for (const item of ring) collected.push(item);
    expect(collected).toEqual([1, 2, 3]);
    expect([...ring]).toEqual([1, 2, 3]);
    expect([...ring.values()]).toEqual([1, 2, 3]);
    expect([...ring.keys()]).toEqual([0, 1, 2]);
    expect([...ring.entries()]).toEqual([[0, 1], [1, 2], [2, 3]]);
    expect(Array.from(ring, (x) => x * 2)).toEqual([2, 4, 6]);
  });

  it('drains buffer into target array efficiently', () => {
    const ring = new RingBuffer<number>(4);
    ring.pushMany([1, 2, 3]);
    const sink: number[] = [99];

    const drained = ring.drainInto(sink);
    expect(drained).toBe(3);
    expect(sink).toEqual([99, 1, 2, 3]);
    expect(ring.isEmpty).toBe(true);
  });

  it('monotonically increments revision counter on mutations', () => {
    const ring = new RingBuffer<number>(3);
    expect(ring.revision).toBe(0);

    ring.push(1);
    expect(ring.revision).toBe(1);
    ring.push(2);
    expect(ring.revision).toBe(2);
    ring.pop();
    expect(ring.revision).toBe(3);
    ring.clear();
    expect(ring.revision).toBe(4);
  });
});
