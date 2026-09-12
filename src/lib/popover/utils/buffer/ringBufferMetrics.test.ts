import { describe, it, expect, vi } from 'vitest';
import { RingBuffer } from './ringBufferCore';
import { DISPOSE_SYMBOL } from '../disposable';

describe('RingBuffer Metrics & Lifecycle', () => {
  it('accepts options object and initial items', () => {
    const ring = new RingBuffer<number>({
      capacity: 4,
      initialItems: [100, 200],
    });
    expect(ring.size).toBe(2);
    expect(ring.capacity).toBe(4);
    expect(ring.peekOldest()).toBe(100);
    expect(ring.peek()).toBe(200);
  });

  it('invokes onEvict callback upon overflow and clear', () => {
    const onEvict = vi.fn();
    const ring = new RingBuffer<string>({ capacity: 2, onEvict });

    ring.push('x');
    ring.push('y');
    ring.push('z');
    expect(onEvict).toHaveBeenCalledWith('x');

    ring.clear();
    expect(onEvict).toHaveBeenCalledWith('y');
    expect(onEvict).toHaveBeenCalledWith('z');
  });

  it('tracks comprehensive operational metrics', () => {
    const ring = new RingBuffer<number>(2);
    ring.push(1);
    ring.push(2);
    ring.push(3);
    ring.pop();

    const m = ring.getMetrics();
    expect(m.capacity).toBe(2);
    expect(m.size).toBe(1);
    expect(m.peakSize).toBe(2);
    expect(m.totalPushes).toBe(3);
    expect(m.totalEvictions).toBe(1);
    expect(m.totalPops).toBe(1);
    expect(m.evictionRate).toBeCloseTo(1 / 3);
  });

  it('supports RAII disposal pattern', () => {
    const onEvict = vi.fn();
    const ring = new RingBuffer<number>({ capacity: 3, onEvict });
    ring.pushMany([1, 2]);

    ring.dispose();
    expect(ring.isEmpty).toBe(true);
    expect(onEvict).toHaveBeenCalledTimes(2);

    ring.push(3);
    ring[DISPOSE_SYMBOL]?.();
    expect(ring.isEmpty).toBe(true);
  });
});
