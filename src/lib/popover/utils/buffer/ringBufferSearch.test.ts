import { describe, it, expect } from 'vitest';
import { RingBuffer } from './ringBufferCore';

describe('RingBuffer Search & Reduction Algorithms', () => {
  it('finds and locates elements with find and findIndex across circular wraps', () => {
    const ring = new RingBuffer<string>(3);
    ring.pushMany(['a', 'b', 'c']);
    ring.push('d'); // evicts 'a', contains ['b', 'c', 'd']

    expect(ring.find((x) => x === 'c')).toBe('c');
    expect(ring.find((x) => x === 'z')).toBeUndefined();

    expect(ring.findIndex((x) => x === 'b')).toBe(0);
    expect(ring.findIndex((x) => x === 'd')).toBe(2);
    expect(ring.findIndex((x) => x === 'a')).toBe(-1);
  });

  it('performs reverse lookup with findLast and findLastIndex', () => {
    const ring = new RingBuffer<{ id: number; tag: string }>(4);
    ring.pushMany([
      { id: 1, tag: 'x' },
      { id: 2, tag: 'y' },
      { id: 3, tag: 'x' },
    ]);

    expect(ring.findLast((item) => item.tag === 'x')?.id).toBe(3);
    expect(ring.findLastIndex((item) => item.tag === 'x')).toBe(2);
    expect(ring.findLast((item) => item.tag === 'missing')).toBeUndefined();
    expect(ring.findLastIndex((item) => item.tag === 'missing')).toBe(-1);
  });

  it('evaluates boolean predicates with some and every', () => {
    const ring = new RingBuffer<number>(4);
    ring.pushMany([2, 4, 6]);

    expect(ring.every((x) => x % 2 === 0)).toBe(true);
    expect(ring.some((x) => x === 4)).toBe(true);
    expect(ring.some((x) => x === 5)).toBe(false);

    ring.push(7);
    expect(ring.every((x) => x % 2 === 0)).toBe(false);
  });

  it('reduces elements from left and right with zero intermediate allocations', () => {
    const ring = new RingBuffer<number>(4);
    ring.pushMany([10, 20, 30]);

    const sum = ring.reduce((acc, val) => acc + val, 0);
    expect(sum).toBe(60);

    const strLtoR = ring.reduce((acc, val) => acc + String(val), '');
    expect(strLtoR).toBe('102030');

    const strRtoL = ring.reduceRight((acc, val) => acc + String(val), '');
    expect(strRtoL).toBe('302010');
  });

  it('locates values with indexOf and includes', () => {
    const ring = new RingBuffer<string>(3);
    ring.pushMany(['foo', 'bar', 'baz']);
    expect(ring.indexOf('bar')).toBe(1);
    expect(ring.indexOf('qux')).toBe(-1);
    const hasBar = ring.includes('bar');
    const hasQux = ring.includes('qux');
    expect(hasBar).toBe(true);
    expect(hasQux).toBe(false);

    ring.push('qux'); // evicts 'foo', contains ['bar', 'baz', 'qux']
    const hasFooAfter = ring.includes('foo');
    const hasQuxAfter = ring.includes('qux');
    expect(hasFooAfter).toBe(false);
    expect(hasQuxAfter).toBe(true);
    expect(ring.indexOf('qux')).toBe(2);
    expect(ring.indexOf('bar', 1)).toBe(-1);

    const dup = new RingBuffer<string>(4);
    dup.pushMany(['a', 'b', 'a', 'c']);
    expect(dup.lastIndexOf('a')).toBe(2);
    expect(dup.lastIndexOf('a', 1)).toBe(0);
    expect(dup.lastIndexOf('missing')).toBe(-1);
    expect(dup.lastIndexOf('a', -2)).toBe(2);
  });
});
