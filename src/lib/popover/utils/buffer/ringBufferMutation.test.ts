/**
 * In-Place Mutation and Memory Reclamation Unit Tests for RingBuffer.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/ringBufferMutation.test
 */

import { describe, it, expect } from 'vitest';
import { RingBuffer } from './ringBufferCore';

describe('RingBuffer In-Place Mutations & Memory Reclamation', () => {
  it('swaps elements in-place with bounds checking', () => {
    const ring = new RingBuffer<string>(4);
    ring.pushMany(['a', 'b', 'c', 'd']);

    expect(ring.swap(0, 2)).toBe(true);
    expect(ring.toArray()).toEqual(['c', 'b', 'a', 'd']);

    expect(ring.swap(-1, 1)).toBe(true);
    expect(ring.toArray()).toEqual(['c', 'd', 'a', 'b']);

    expect(ring.swap(1, 1)).toBe(true);
    expect(ring.toArray()).toEqual(['c', 'd', 'a', 'b']);

    expect(ring.swap(0, 10)).toBe(false);
    expect(ring.swap(-10, 0)).toBe(false);
  });

  it('reverses active elements in-place across wrapped buffers', () => {
    const ring = new RingBuffer<number>(4);
    ring.pushMany([1, 2, 3, 4]);
    ring.push(5);

    ring.reverse();
    expect(ring.toArray()).toEqual([5, 4, 3, 2]);

    ring.reverse();
    expect(ring.toArray()).toEqual([2, 3, 4, 5]);

    const single = new RingBuffer<number>(3);
    single.push(42);
    single.reverse();
    expect(single.toArray()).toEqual([42]);
  });

  it('fills active slots with given value', () => {
    const ring = new RingBuffer<number>(4);
    ring.pushMany([1, 2, 3]);

    ring.fill(0);
    expect(ring.size).toBe(3);
    expect(ring.toArray()).toEqual([0, 0, 0]);
  });

  it('reclaims unused capacity via shrinkToFit', () => {
    const ring = new RingBuffer<number>({ capacity: 16 });
    ring.pushMany([10, 20, 30]);
    expect(ring.capacity).toBe(16);

    ring.shrinkToFit();
    expect(ring.capacity).toBe(3);
    expect(ring.toArray()).toEqual([10, 20, 30]);

    const empty = new RingBuffer<number>(8);
    empty.shrinkToFit();
    expect(empty.capacity).toBe(1);
    expect(empty.isEmpty).toBe(true);
  });
});
