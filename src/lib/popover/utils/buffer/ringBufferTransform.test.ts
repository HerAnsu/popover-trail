import { describe, it, expect } from 'vitest';
import { RingBuffer } from './ringBufferCore';

describe('RingBuffer Functional Transformations', () => {
  it('maps elements into a new RingBuffer directly without intermediate arrays', () => {
    const ring = new RingBuffer<number>(4);
    ring.pushMany([1, 2, 3]);

    const mapped = ring.map((x, idx) => `item-${x * 2}-${idx}`);
    expect(mapped).toBeInstanceOf(RingBuffer);
    expect(mapped.capacity).toBe(4);
    expect(mapped.size).toBe(3);
    expect(mapped.toArray()).toEqual(['item-2-0', 'item-4-1', 'item-6-2']);
  });

  it('filters elements into a new RingBuffer directly', () => {
    const ring = new RingBuffer<number>(5);
    ring.pushMany([1, 2, 3, 4, 5]);

    const evens = ring.filter((x) => x % 2 === 0);
    expect(evens).toBeInstanceOf(RingBuffer);
    expect(evens.capacity).toBe(5);
    expect(evens.size).toBe(2);
    expect(evens.toArray()).toEqual([2, 4]);
  });

  it('provides compile-time read-only projection via asReadonly', () => {
    const ring = new RingBuffer<number>(3);
    ring.push(10);
    ring.push(20);

    const ro = ring.asReadonly();
    expect(ro.size).toBe(2);
    expect(ro.peek()).toBe(20);
    expect(ro.peekOldest()).toBe(10);
    expect(ro.toArray()).toEqual([10, 20]);
  });

  it('narrows elements using a custom type guard in filter', () => {
    type Shape = { kind: 'circle'; r: number } | { kind: 'square'; s: number };
    const ring = new RingBuffer<Shape>(4);
    ring.push({ kind: 'circle', r: 10 });
    ring.push({ kind: 'square', s: 5 });
    ring.push({ kind: 'circle', r: 20 });

    const isCircle = (s: Shape): s is { kind: 'circle'; r: number } => s.kind === 'circle';
    const circles = ring.filter(isCircle);
    expect(circles.size).toBe(2);
    expect(circles.toArray()).toEqual([
      { kind: 'circle', r: 10 },
      { kind: 'circle', r: 20 },
    ]);
  });

  it('flatMaps elements into a new RingBuffer supporting iterables and scalars', () => {
    const ring = new RingBuffer<number>(6);
    ring.pushMany([1, 2, 3]);

    const flat = ring.flatMap((x) => [x, x * 10]);
    expect(flat).toBeInstanceOf(RingBuffer);
    expect(flat.size).toBe(6);
    expect(flat.toArray()).toEqual([1, 10, 2, 20, 3, 30]);

    const single = ring.flatMap((x) => x * 2);
    expect(single.toArray()).toEqual([2, 4, 6]);
  });
});
