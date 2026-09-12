import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ObjectPool,
  globalPoolRegistry,
  sharedPointPool,
  sharedBoxPool,
  sharedSetPool,
  createPointPool,
  createBoxPool,
  createSetPool,
} from './objectPool';

describe('ObjectPool utility', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('pre-allocates objects based on initial capacity', () => {
    const factory = vi.fn(() => ({ x: 0, y: 0 }));
    const pool = new ObjectPool(factory, undefined, 5);

    expect(factory).toHaveBeenCalledTimes(5);
    const obj = pool.acquire();
    expect(obj).toEqual({ x: 0, y: 0 });
  });

  it('supports options object constructor', () => {
    const factory = vi.fn(() => ({ x: 0, y: 0 }));
    const pool = new ObjectPool({
      factory,
      initialCapacity: 4,
      maxCapacity: 16,
    });

    expect(factory).toHaveBeenCalledTimes(4);
    expect(pool.size).toBe(4);
    expect(pool.capacity).toBe(16);
  });

  it('reuses released objects and invokes reset callback', () => {
    const reset = vi.fn((item: { x: number; y: number }) => {
      item.x = 0;
      item.y = 0;
    });

    const pool = new ObjectPool(() => ({ x: 0, y: 0 }), reset, 1);
    const item = pool.acquire();
    item.x = 100;
    item.y = 200;

    pool.release(item);
    expect(reset).toHaveBeenCalledWith(item);

    const recycled = pool.acquire();
    expect(recycled).toBe(item);
    expect(recycled.x).toBe(0);
  });

  it('creates new instances via factory when pool is exhausted', () => {
    let id = 0;
    const pool = new ObjectPool(() => ({ id: ++id }), undefined, 0);

    const obj1 = pool.acquire();
    const obj2 = pool.acquire();
    expect(obj1.id).toBe(1);
    expect(obj2.id).toBe(2);
  });

  it('clears pool capacity and drains items', () => {
    const pool = new ObjectPool(() => ({ x: 0 }), undefined, 10);
    pool.clear();
    expect(pool.size).toBe(0);

    const factory = vi.fn(() => ({ x: 1 }));
    const pool2 = new ObjectPool(factory, undefined, 2);
    pool2.clear();
    pool2.acquire();
    expect(factory).toHaveBeenCalledTimes(3);
  });

  it('safely ignores null or undefined releases and tracks size', () => {
    const pool = new ObjectPool(() => ({ x: 0 }), undefined, 2);
    expect(pool.size).toBe(2);

    pool.release(null);
    pool.release(undefined);
    expect(pool.size).toBe(2);
    expect(() => pool.dispose()).not.toThrow();
  });

  it('prevents double-free when releasing the same object twice in O(1)', () => {
    const pool = new ObjectPool(() => ({ x: 0 }), undefined, 0, 10);
    const item = { x: 42 };
    pool.release(item);
    expect(pool.size).toBe(1);

    pool.release(item);
    expect(pool.size).toBe(1);
  });

  it('caps initial capacity to maxCapacity', () => {
    const factory = vi.fn(() => ({ x: 0 }));
    const pool = new ObjectPool(factory, undefined, 100, 10);
    expect(pool.size).toBe(10);
    expect(factory).toHaveBeenCalledTimes(10);
  });

  it('executes scoped work via runWith and automatically returns item to pool', () => {
    const pool = new ObjectPool(
      () => ({ val: 0 }),
      (i) => {
        i.val = 0;
      },
      1,
      10,
    );
    expect(pool.size).toBe(1);

    const res = pool.runWith((item) => {
      item.val = 42;
      return item.val * 2;
    });

    expect(res).toBe(84);
    expect(pool.size).toBe(1);
  });

  it('guarantees release in runWith even when callback throws an exception', () => {
    const pool = new ObjectPool(() => ({ val: 0 }), undefined, 1, 10);
    expect(pool.size).toBe(1);

    expect(() => {
      pool.runWith(() => {
        throw new Error('Failure in worker');
      });
    }).toThrow('Failure in worker');

    expect(pool.size).toBe(1);
  });

  it('executes async scoped work via runWithAsync', async () => {
    const pool = new ObjectPool(() => ({ val: 0 }), undefined, 1, 10);
    const res = await pool.runWithAsync(async (item) => {
      item.val = 10;
      await Promise.resolve();
      return item.val * 3;
    });

    expect(res).toBe(30);
    expect(pool.size).toBe(1);
  });

  it('supports acquireScoped with explicit disposal', () => {
    const pool = new ObjectPool(() => ({ active: true }), undefined, 1, 10);
    expect(pool.size).toBe(1);

    const scoped = pool.acquireScoped();
    expect(scoped.value).toEqual({ active: true });
    expect(pool.size).toBe(0);

    scoped.release();
    expect(pool.size).toBe(1);

    scoped.release();
    expect(pool.size).toBe(1);

    const scoped2 = pool.acquireScoped();
    expect(pool.size).toBe(0);
    scoped2.dispose();
    expect(pool.size).toBe(1);
  });

  it('tracks accurate metrics for hits, misses, inUse, and peakInUse', () => {
    const pool = new ObjectPool(() => ({ id: Math.random() }), undefined, 2, 5);

    const m1 = pool.getMetrics();
    expect(m1.allocated).toBe(2);
    expect(m1.available).toBe(2);
    expect(m1.inUse).toBe(0);

    const i1 = pool.acquire();
    const i2 = pool.acquire();
    const i3 = pool.acquire();

    const m2 = pool.getMetrics();
    expect(m2.hits).toBe(2);
    expect(m2.misses).toBe(1);
    expect(m2.inUse).toBe(3);
    expect(m2.peakInUse).toBe(3);
    expect(m2.hitRate).toBeCloseTo(2 / 3);

    pool.release(i1);
    pool.release(i2);
    pool.release(i3);

    const m3 = pool.getMetrics();
    expect(m3.inUse).toBe(0);
    expect(m3.peakInUse).toBe(3);
    expect(m3.available).toBe(3);
  });

  it('supports preallocate and drain with onEvict callback', () => {
    const onEvict = vi.fn();
    const pool = new ObjectPool({
      factory: () => ({ v: 1 }),
      initialCapacity: 0,
      maxCapacity: 5,
      onEvict,
    });

    pool.preallocate(3);
    expect(pool.size).toBe(3);

    pool.drain(1);
    expect(pool.size).toBe(1);
    expect(onEvict).toHaveBeenCalledTimes(2);

    pool.clear();
    expect(pool.size).toBe(0);
    expect(onEvict).toHaveBeenCalledTimes(3);
  });

  it('performs batch acquireMany and releaseMany operations', () => {
    const pool = new ObjectPool(
      () => ({ counter: 0 }),
      (i) => {
        i.counter = 0;
      },
      5,
      20,
    );

    const batch = pool.acquireMany(3);
    expect(batch).toHaveLength(3);
    expect(pool.size).toBe(2);

    batch.forEach((item, idx) => {
      item.counter = idx + 1;
    });

    pool.releaseMany(batch);
    expect(pool.size).toBe(5);
    expect(pool.acquire().counter).toBe(0);
  });

  it('supports acquireWith and runWithInit for atomic parameterization', () => {
    const pool = new ObjectPool(
      () => ({ x: 0, y: 0 }),
      (pt) => {
        pt.x = 0;
        pt.y = 0;
      },
      2,
    );

    const pt = pool.acquireWith((p) => {
      p.x = 50;
      p.y = 100;
    });
    expect(pt).toEqual({ x: 50, y: 100 });
    pool.release(pt);

    const result = pool.runWithInit(
      (p) => {
        p.x = 10;
        p.y = 20;
      },
      (p) => p.x + p.y,
    );
    expect(result).toBe(30);
    expect(pool.size).toBe(2);
  });

  it('detects unreleased objects when leak detection is enabled', () => {
    const pool = new ObjectPool({
      factory: () => ({ id: Math.random() }),
      enableLeakDetection: true,
      leakTimeoutMs: 50,
    });

    const item1 = pool.acquire();
    const item2 = pool.acquire();

    // Check leaks at past time:
    const leaksImmediate = pool.getLeakedObjects(50);
    expect(leaksImmediate.size).toBe(0);

    // After simulated time > 50ms:
    const futureTime = Date.now() + 100;
    const leaksAfter = pool.getLeakedObjects(50, futureTime);
    expect(leaksAfter.size).toBe(2);
    expect(leaksAfter.has(item1)).toBe(true);
    expect(leaksAfter.has(item2)).toBe(true);

    pool.release(item1);
    const leaksPartial = pool.getLeakedObjects(50, futureTime);
    expect(leaksPartial.size).toBe(1);
    expect(leaksPartial.has(item2)).toBe(true);

    pool.release(item2);
    expect(pool.getLeakedObjects(50, futureTime).size).toBe(0);
  });

  it('executes adaptive idle drain after delay', () => {
    vi.useFakeTimers();

    const pool = new ObjectPool({
      factory: () => ({ n: 1 }),
      initialCapacity: 2,
      maxCapacity: 10,
      idleDrainTimeoutMs: 1000,
    });

    // Expand pool with extra acquisitions
    const i1 = pool.acquire();
    const i2 = pool.acquire();
    const i3 = pool.acquire();
    const i4 = pool.acquire();

    pool.release(i1);
    pool.release(i2);
    pool.release(i3);
    pool.release(i4);

    expect(pool.size).toBe(4);

    // Fast-forward 500ms (not yet reached)
    vi.advanceTimersByTime(500);
    expect(pool.size).toBe(4);

    // Fast-forward past 1000ms idle threshold -> drains to initialCapacity (2)
    vi.advanceTimersByTime(600);
    expect(pool.size).toBe(2);

    pool.dispose();
  });

  it('manages shared spatial pools in global registry', () => {
    expect(globalPoolRegistry.has('spatial-point')).toBe(true);
    expect(globalPoolRegistry.has('spatial-box')).toBe(true);
    expect(globalPoolRegistry.has('spatial-set')).toBe(true);

    const ptPool = globalPoolRegistry.get('spatial-point');
    expect(ptPool).toBe(sharedPointPool);

    const boxPool = globalPoolRegistry.get('spatial-box');
    expect(boxPool).toBe(sharedBoxPool);

    const setPool = globalPoolRegistry.get('spatial-set');
    expect(setPool).toBe(sharedSetPool);

    const customPointPool = createPointPool(10, 50);
    expect(customPointPool.size).toBe(10);
    const pt = customPointPool.acquire();
    expect(pt).toEqual({ x: 0, y: 0 });

    const customBoxPool = createBoxPool(5, 20);
    expect(customBoxPool.size).toBe(5);
    const box = customBoxPool.acquire();
    expect(box).toMatchObject({ top: 0, left: 0, width: 0, height: 0, x: 0, y: 0 });

    const customSetPool = createSetPool<number>(3, 10);
    expect(customSetPool.size).toBe(3);
    const set = customSetPool.acquire();
    expect(set.size).toBe(0);

    const aggMetrics = globalPoolRegistry.getAggregatedMetrics();
    expect(aggMetrics.totalPools).toBeGreaterThanOrEqual(3);
    expect(aggMetrics.totalAllocated).toBeGreaterThan(0);
  });

  it('creates pool safely via monadic ObjectPool.create factory', () => {
    const validRes = ObjectPool.create({
      factory: () => ({ v: 1 }),
      initialCapacity: 2,
      maxCapacity: 5,
    });
    expect(validRes.success).toBe(true);
    if (validRes.success) {
      expect(validRes.data.size).toBe(2);
      expect(validRes.data.capacity).toBe(5);
    }

    const invalidRes = ObjectPool.create({} as never);
    expect(invalidRes.success).toBe(false);
    if (!invalidRes.success) {
      expect(invalidRes.error.code).toBe('INVALID_POOL_OPTIONS');
    }
  });

  it('supports monadic acquireResult with disposed state containment', () => {
    const pool = new ObjectPool(() => ({ ready: true }), undefined, 1, 2);
    const res1 = pool.acquireResult();
    expect(res1.success).toBe(true);
    if (res1.success) {
      expect(res1.data).toEqual({ ready: true });
    }

    pool.dispose();
    const res2 = pool.acquireResult();
    expect(res2.success).toBe(false);
    if (!res2.success) {
      expect(res2.error.code).toBe('POOL_DISPOSED');
    }
  });

  it('maintains fault isolation when reset callback throws an exception', () => {
    const brokenReset = vi.fn(() => {
      throw new Error('Reset crashed');
    });
    const pool = new ObjectPool(() => ({ count: 0 }), brokenReset, 1, 2);
    const item = pool.acquire();

    expect(() => pool.release(item)).not.toThrow();
    expect(pool.size).toBe(1);
    expect(brokenReset).toHaveBeenCalled();
  });

  it('maintains fault isolation when onEvict callback throws an exception', () => {
    const brokenEvict = vi.fn(() => {
      throw new Error('Evict crashed');
    });
    const pool = new ObjectPool({
      factory: () => ({ x: 1 }),
      initialCapacity: 3,
      maxCapacity: 3,
      onEvict: brokenEvict,
    });

    expect(() => pool.drain(0)).not.toThrow();
    expect(pool.size).toBe(0);
    expect(brokenEvict).toHaveBeenCalledTimes(3);
  });
});
