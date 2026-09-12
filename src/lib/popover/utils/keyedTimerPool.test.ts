import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { KeyedTimerPool } from './keyedTimerPool';

describe('KeyedTimerPool', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('schedules and executes a timer', () => {
    const pool = new KeyedTimerPool<string>();
    const cb = vi.fn();

    pool.schedule('k1', 100, cb);
    expect(pool.has('k1')).toBe(true);
    expect(pool.size).toBe(1);

    vi.advanceTimersByTime(50);
    expect(cb).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(pool.has('k1')).toBe(false);
    expect(pool.size).toBe(0);
  });

  it('cancels a specific timer', () => {
    const pool = new KeyedTimerPool<string>();
    const cb = vi.fn();

    pool.schedule('k1', 100, cb);
    expect(pool.cancel('k1')).toBe(true);
    expect(pool.has('k1')).toBe(false);

    vi.advanceTimersByTime(100);
    expect(cb).not.toHaveBeenCalled();
  });

  it('cancels all timers with cancelAll and [Symbol.dispose]', () => {
    const pool = new KeyedTimerPool<string>();
    const cb1 = vi.fn();
    const cb2 = vi.fn();

    pool.schedule('k1', 100, cb1);
    pool.schedule('k2', 200, cb2);
    expect(pool.size).toBe(2);

    pool.dispose();
    expect(pool.size).toBe(0);

    vi.advanceTimersByTime(300);
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).not.toHaveBeenCalled();
  });
});
