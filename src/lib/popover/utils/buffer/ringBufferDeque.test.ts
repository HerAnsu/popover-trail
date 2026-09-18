import { describe, it, expect, vi } from 'vitest';
import { RingBuffer } from './ringBufferCore';

describe('RingBuffer Deque & Resizing Capabilities', () => {
  it('operates as a high-performance FIFO queue via push and shift', () => {
    const queue = new RingBuffer<string>(4);
    queue.push('task-1');
    queue.push('task-2');
    queue.push('task-3');

    expect(queue.shift()).toBe('task-1');
    expect(queue.size).toBe(2);
    expect(queue.peekFirst()).toBe('task-2');
    expect(queue.peekLast()).toBe('task-3');

    queue.push('task-4');
    expect(queue.shift()).toBe('task-2');
    expect(queue.shift()).toBe('task-3');
    expect(queue.shift()).toBe('task-4');
    expect(queue.shift()).toBeUndefined();
    expect(queue.isEmpty).toBe(true);
  });

  it('supports unshift prepending with eviction when full', () => {
    const onEvict = vi.fn();
    const ring = new RingBuffer<number>({ capacity: 3, onEvict });
    ring.unshift(10);
    ring.unshift(20);
    expect(ring.toArray()).toEqual([20, 10]);

    ring.unshift(30);
    expect(ring.toArray()).toEqual([30, 20, 10]);

    ring.unshift(40); // should evict tail (10)
    expect(onEvict).toHaveBeenCalledWith(10);
    expect(ring.toArray()).toEqual([40, 30, 20]);
  });

  it('supports slicing, cloning, and copying to target buffers', () => {
    const ring = new RingBuffer<number>(5);
    ring.pushMany([1, 2, 3, 4, 5]);

    expect(ring.slice(1, 4)).toEqual([2, 3, 4]);
    expect(ring.slice(-2)).toEqual([4, 5]);

    const clone = ring.clone();
    expect(clone.toArray()).toEqual([1, 2, 3, 4, 5]);

    const sink = Array.from<number | undefined>({ length: 7 });
    const copied = ring.copyTo(sink, 1);
    expect(copied).toBe(5);
    expect(sink).toEqual([undefined, 1, 2, 3, 4, 5, undefined]);
  });

  it('resizes dynamically and supports autoExpand mode', () => {
    const ring = new RingBuffer<number>({ capacity: 2, autoExpand: true, maxCapacity: 8 });
    ring.push(1);
    ring.push(2);
    expect(ring.capacity).toBe(2);

    ring.push(3); // triggers autoExpand to 4
    expect(ring.capacity).toBe(4);
    expect(ring.size).toBe(3);
    expect(ring.toArray()).toEqual([1, 2, 3]);

    ring.resize(2); // shrinking
    expect(ring.capacity).toBe(2);
    expect(ring.size).toBe(2);
    expect(ring.toArray()).toEqual([2, 3]);
  });
});
