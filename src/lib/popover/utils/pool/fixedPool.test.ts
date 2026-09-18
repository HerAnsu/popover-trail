import { describe, it, expect, vi } from 'vitest';
import { FixedPool } from './fixedPool';
import { DISPOSE_SYMBOL } from '../disposable';

describe('FixedPool', () => {
  it('preallocates all slots and recycles items in LIFO order', () => {
    let allocCount = 0;
    const pool = new FixedPool(() => ({ id: ++allocCount }), 3);

    expect(pool.capacity).toBe(3);
    expect(pool.size).toBe(3);
    expect(pool.isFull).toBe(true);
    expect(allocCount).toBe(3);

    const a = pool.acquire();
    const b = pool.acquire();
    expect(a).toBeDefined();
    expect(pool.size).toBe(1);
    expect(pool.inUse).toBe(2);

    expect(pool.release(b)).toBe(true);
    expect(pool.size).toBe(2);

    const c = pool.acquire();
    expect(c).toBe(b);
  });

  it('falls back to factory on exhaustion and rejects excess or invalid releases', () => {
    let count = 0;
    const pool = new FixedPool(() => ({ n: ++count }), 2);

    const i1 = pool.acquire();
    const i2 = pool.acquire();
    expect(pool.isEmpty).toBe(true);

    const i3 = pool.acquire(); // exhausted -> fallback factory
    expect(i3.n).toBe(3);

    expect(pool.release(null)).toBe(false);
    expect(pool.release(undefined)).toBe(false);

    expect(pool.release(i1)).toBe(true);
    expect(pool.release(i2)).toBe(true);
    expect(pool.release(i3)).toBe(false); // exceeds capacity
    expect(pool.size).toBe(2);
    expect(pool.isFull).toBe(true);
  });

  it('executes reset hook on release and handles runWith RAII scoping with errors', () => {
    const reset = vi.fn((item: { val: number }) => {
      item.val = 0;
    });
    const pool = new FixedPool(() => ({ val: 1 }), 2, reset);

    const result = pool.runWith((item) => {
      item.val = 99;
      return item.val * 2;
    });
    expect(result).toBe(198);
    expect(reset).toHaveBeenCalled();
    expect(pool.size).toBe(2);

    expect(() =>
      pool.runWith((item) => {
        item.val = 42;
        throw new Error('Scoped failure');
      }),
    ).toThrow('Scoped failure');

    // Released back despite thrown exception
    expect(pool.size).toBe(2);
    expect(pool.acquire().val).toBe(0);
  });

  it('clears and disposes pool resources cleanly', () => {
    const pool = new FixedPool(() => ({ flag: true }), 4);
    expect(pool.size).toBe(4);

    pool.clear();
    expect(pool.size).toBe(0);
    expect(pool.isEmpty).toBe(true);

    pool.dispose();
    expect(pool.size).toBe(0);

    const disposeFn = pool[DISPOSE_SYMBOL];
    if (typeof disposeFn === 'function') {
      disposeFn.call(pool);
    }
    expect(pool.size).toBe(0);
  });
});
