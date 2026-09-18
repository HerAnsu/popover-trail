import { describe, it, expect } from 'vitest';
import { ObjectPool } from './objectPoolCore';
import { checkPoolClean, assertPoolClean } from './poolAssert';

describe('poolAssert', () => {
  it('returns true when pool has 0 items in use', () => {
    const pool = new ObjectPool(() => ({ x: 0 }), undefined, 2, 5);
    expect(checkPoolClean(pool)).toBe(true);
    expect(pool.isClean).toBe(true);
    expect(pool.assertClean()).toBe(true);
    expect(assertPoolClean(pool)).toBe(true);
  });

  it('throws assertion error when pool has in-flight unreleased items', () => {
    const pool = new ObjectPool({
      factory: () => ({ id: Math.random() }),
      enableLeakDetection: true,
      initialCapacity: 2,
      maxCapacity: 5,
    });

    const leaked = pool.acquire();
    expect(pool.isClean).toBe(false);
    expect(checkPoolClean(pool)).toBe(false);

    expect(() => {
      pool.assertClean();
    }).toThrow(/\[ObjectPool Assertion Failed\]: Pool has 1 unreleased item/);

    pool.release(leaked);
    expect(pool.isClean).toBe(true);
    expect(() => pool.assertClean()).not.toThrow();
  });

  it('supports using syntax with pool.scope()', () => {
    const pool = new ObjectPool(() => ({ ready: true }), undefined, 2, 5);
    expect(pool.size).toBe(2);

    const scoped = pool.scope();
    expect(scoped.value).toEqual({ ready: true });
    expect(pool.size).toBe(1);

    scoped.release();
    expect(pool.size).toBe(2);
    expect(pool.isClean).toBe(true);
  });
});
