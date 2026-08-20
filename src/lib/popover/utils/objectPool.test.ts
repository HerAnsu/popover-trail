import { describe, it, expect, vi } from 'vitest';
import { ObjectPool } from './objectPool';

describe('ObjectPool utility', () => {
  it('pre-allocates objects based on initial capacity', () => {
    const factory = vi.fn(() => ({ x: 0, y: 0 }));
    const pool = new ObjectPool(factory, undefined, 5);

    expect(factory).toHaveBeenCalledTimes(5);

    const obj = pool.acquire();
    expect(obj).toEqual({ x: 0, y: 0 });
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

  it('clears pool capacity', () => {
    const pool = new ObjectPool(() => ({ x: 0 }), undefined, 10);
    pool.clear();
    // Acquiring after clear calls factory for fresh object
    const factory = vi.fn(() => ({ x: 1 }));
    const pool2 = new ObjectPool(factory, undefined, 2);
    pool2.clear();
    pool2.acquire();
    expect(factory).toHaveBeenCalledTimes(3); // 2 initial + 1 after clear
  });

  it('safely ignores null or undefined releases and tracks size', () => {
    const pool = new ObjectPool(() => ({ x: 0 }), undefined, 2);
    expect(pool.size).toBe(2);

    pool.release(null);
    pool.release(undefined);
    expect(pool.size).toBe(2);

    expect(() => pool.dispose()).not.toThrow();
  });
});
