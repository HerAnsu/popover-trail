import { describe, it, expect } from 'vitest';
import { createArrayPool, createMapPool, sharedArrayPool, sharedMapPool } from './poolCollections';
import { globalPoolRegistry } from './poolRegistry';

describe('poolCollections', () => {
  it('creates and recycles array instances with zero length on reset', () => {
    const pool = createArrayPool<number>(4, 16);
    expect(pool.size).toBe(4);

    const arr = pool.acquire();
    arr.push(1, 2, 3);
    expect(arr).toEqual([1, 2, 3]);

    pool.release(arr);
    const recycled = pool.acquire();
    expect(recycled).toBe(arr);
    expect(recycled).toHaveLength(0);
  });

  it('creates and recycles Map instances with empty state on reset', () => {
    const pool = createMapPool<string, number>(2, 8);
    expect(pool.size).toBe(2);

    const map = pool.acquire();
    map.set('key', 100);
    expect(map.size).toBe(1);

    pool.release(map);
    const recycled = pool.acquire();
    expect(recycled).toBe(map);
    expect(recycled.size).toBe(0);
  });

  it('registers sharedArrayPool and sharedMapPool in global registry', () => {
    expect(globalPoolRegistry.has('collection-array')).toBe(true);
    expect(globalPoolRegistry.has('collection-map')).toBe(true);
    expect(globalPoolRegistry.get('collection-array')).toBe(sharedArrayPool);
    expect(globalPoolRegistry.get('collection-map')).toBe(sharedMapPool);
  });
});
