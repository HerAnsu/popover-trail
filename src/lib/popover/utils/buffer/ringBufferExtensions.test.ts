import { describe, it, expect } from 'vitest';
import { RingBuffer } from './ringBufferCore';

describe('RingBuffer Advanced DX Extensions', () => {
  it('creates buffer from variadic items via RingBuffer.of', () => {
    const ring = RingBuffer.of(10, 20, 30);
    expect(ring.capacity).toBe(3);
    expect(ring.size).toBe(3);
    expect(ring.toArray()).toEqual([10, 20, 30]);

    const empty = RingBuffer.of<number>();
    expect(empty.capacity).toBe(1);
    expect(empty.isEmpty).toBe(true);
  });

  it('yields adjacent pairs via slidingPairs', () => {
    const ring = RingBuffer.of(1, 2, 3, 4);
    const pairs = [...ring.slidingPairs()];
    expect(pairs).toEqual([
      [1, 2],
      [2, 3],
      [3, 4],
    ]);

    const single = RingBuffer.of(42);
    expect([...single.slidingPairs()]).toEqual([]);
  });

  it('slidingPairs handles circular wrapping accurately', () => {
    const ring = new RingBuffer<string>(3);
    ring.push('a').push('b').push('c').push('d');
    expect([...ring.slidingPairs()]).toEqual([
      ['b', 'c'],
      ['c', 'd'],
    ]);
  });

  it('chunks items into sliding windows with configurable step', () => {
    const ring = RingBuffer.of(1, 2, 3, 4, 5);
    const w3 = [...ring.windows(3, 1)];
    expect(w3).toEqual([
      [1, 2, 3],
      [2, 3, 4],
      [3, 4, 5],
    ]);

    const w2step2 = [...ring.windows(2, 2)];
    expect(w2step2).toEqual([
      [1, 2],
      [3, 4],
    ]);

    expect([...ring.windows(10)]).toEqual([]);
    expect([...ring.windows(0)]).toEqual([]);
  });

  it('extracts head and tail elements with take and takeLast', () => {
    const ring = RingBuffer.of('a', 'b', 'c', 'd');
    expect(ring.take(2)).toEqual(['a', 'b']);
    expect(ring.take(10)).toEqual(['a', 'b', 'c', 'd']);
    expect(ring.take(0)).toEqual([]);

    expect(ring.takeLast(2)).toEqual(['c', 'd']);
    expect(ring.takeLast(10)).toEqual(['a', 'b', 'c', 'd']);
    expect(ring.takeLast(0)).toEqual([]);
  });

  it('counts elements matching predicate via count', () => {
    const ring = RingBuffer.of(1, 2, 3, 4, 5, 6, 7, 8);
    expect(ring.count((x) => x % 2 === 0)).toBe(4);
    expect(ring.count((x) => x > 5)).toBe(3);
    expect(ring.count((x) => x < 0)).toBe(0);
  });

  it('destructively drains buffer via drain iterator', () => {
    const ring = RingBuffer.of(100, 200, 300);
    const drained: number[] = [];
    for (const item of ring.drain()) {
      drained.push(item);
    }
    expect(drained).toEqual([100, 200, 300]);
    expect(ring.isEmpty).toBe(true);
    expect(ring.size).toBe(0);
  });

  it('supports fluent chaining on resize and shrinkToFit', () => {
    const ring = new RingBuffer<number>(8);
    ring.push(1).push(2);

    const same1 = ring.resize(16);
    expect(same1).toBe(ring);
    expect(ring.capacity).toBe(16);

    const same2 = ring.shrinkToFit();
    expect(same2).toBe(ring);
    expect(ring.capacity).toBe(2);
    expect(ring.toArray()).toEqual([1, 2]);
  });
});