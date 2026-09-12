import { describe, it, expect } from 'vitest';
import { PoolStorage } from './poolStorage';
import { toPoolCapacity } from './poolBranded';

describe('PoolStorage', () => {
  it('manages item slots and respects capacity boundaries', () => {
    const storage = new PoolStorage<object>(toPoolCapacity(3));
    expect(storage.capacity).toBe(3);
    expect(storage.size).toBe(0);
    expect(storage.isEmpty).toBe(true);
    expect(storage.isFull).toBe(false);

    const a = {};
    const b = {};
    const c = {};
    const d = {};

    expect(storage.push(a)).toBe(true);
    expect(storage.push(b)).toBe(true);
    expect(storage.push(c)).toBe(true);
    expect(storage.isFull).toBe(true);
    expect(storage.push(d)).toBe(false); // full
    expect(storage.size).toBe(3);

    expect(storage.has(a)).toBe(true);
    expect(storage.has(d)).toBe(false);
  });

  it('prevents double-free of the same object reference', () => {
    const storage = new PoolStorage<object>(toPoolCapacity(5));
    const item = {};

    expect(storage.push(item)).toBe(true);
    expect(storage.push(item)).toBe(false); // already in pool
    expect(storage.size).toBe(1);
  });

  it('pops items in LIFO order and updates set membership', () => {
    const storage = new PoolStorage<number>(toPoolCapacity(5));
    storage.push(1);
    storage.push(2);

    expect(storage.pop()).toBe(2);
    expect(storage.has(2)).toBe(false);
    expect(storage.has(1)).toBe(true);
    expect(storage.pop()).toBe(1);
    expect(storage.pop()).toBeUndefined();
    expect(storage.isEmpty).toBe(true);
  });

  it('preallocates items up to capacity ceiling', () => {
    const storage = new PoolStorage<{ id: number }>(toPoolCapacity(4));
    let counter = 0;
    const added = storage.preallocate(10, () => ({ id: ++counter }));

    expect(added).toBe(4);
    expect(storage.size).toBe(4);
    expect(storage.isFull).toBe(true);
  });

  it('drains items while respecting keepCapacity parameter', () => {
    const storage = new PoolStorage<number>(toPoolCapacity(5));
    storage.push(1);
    storage.push(2);
    storage.push(3);

    const evicted = storage.drain(1);
    expect(evicted).toEqual([3, 2]);
    expect(storage.size).toBe(1);
    expect(storage.pop()).toBe(1);

    storage.push(10);
    const cleared = storage.clear();
    expect(cleared).toEqual([10]);
    expect(storage.isEmpty).toBe(true);
  });
});
