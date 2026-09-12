import { describe, it, expect, vi } from 'vitest';
import { ObjectPool } from './objectPoolCore';
import { shrinkPoolToFit, warmupPool } from './poolMemory';
import { PoolStorage } from './poolStorage';
import { toPoolCapacity } from './poolBranded';

describe('poolMemory', () => {
  it('shrinks pool to fit target capacity with eviction notifications', () => {
    const onEvict = vi.fn();
    const storage = new PoolStorage<object>(toPoolCapacity(10));
    storage.push({});
    storage.push({});
    storage.push({});
    expect(storage.size).toBe(3);

    const evictedCount = shrinkPoolToFit(storage, 1, onEvict);
    expect(evictedCount).toBe(2);
    expect(storage.size).toBe(1);
    expect(onEvict).toHaveBeenCalledTimes(2);
  });

  it('warms up pool to target size', () => {
    const storage = new PoolStorage<{ n: number }>(toPoolCapacity(8));
    storage.push({ n: 1 });
    let id = 1;

    const allocated = warmupPool(storage, 5, () => ({ n: ++id }));
    expect(allocated).toBe(4);
    expect(storage.size).toBe(5);

    // Warmup when already satisfied returns 0
    const extra = warmupPool(storage, 3, () => ({ n: ++id }));
    expect(extra).toBe(0);
  });

  it('integrates warmup and shrinkToFit on ObjectPool instance', () => {
    const pool = new ObjectPool(() => ({ x: 0 }), undefined, 2, 10);
    expect(pool.size).toBe(2);

    pool.warmup(6);
    expect(pool.size).toBe(6);

    pool.shrinkToFit(3);
    expect(pool.size).toBe(3);
  });
});
