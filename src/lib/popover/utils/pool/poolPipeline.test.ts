import { describe, it, expect, vi } from 'vitest';
import { ObjectPool } from './objectPoolCore';
import { mapWithItem, forEachWithItem, reduceWithItem } from './poolPipeline';

describe('poolPipeline', () => {
  it('maps inputs using a single recycled pooled item with zero extra allocations', () => {
    const reset = vi.fn((pt: { x: number; y: number }) => {
      pt.x = 0;
      pt.y = 0;
    });
    const pool = new ObjectPool(() => ({ x: 0, y: 0 }), reset, 5, 10);
    expect(pool.size).toBe(5);

    const inputs = [10, 20, 30];
    const results = pool.mapItems(inputs, (pt, val) => {
      pt.x = val;
      pt.y = val * 2;
      return pt.x + pt.y;
    });

    expect(results).toEqual([30, 60, 90]);
    expect(pool.size).toBe(5);
    // Reset called 2 times in-between loop + 1 time on final pool.release = 3 times
    expect(reset).toHaveBeenCalledTimes(3);

    const direct = mapWithItem(pool, [1, 2], (pt, v) => pt.x + v);
    expect(direct).toEqual([1, 2]);
  });

  it('iterates inputs using forEachItem with single item recycling', () => {
    const pool = new ObjectPool(
      () => ({ counter: 0 }),
      (item) => { item.counter = 0; },
      2,
      5,
    );
    const collected: number[] = [];

    pool.forEachItem(['a', 'b', 'c'], (item, char, idx) => {
      item.counter = char.charCodeAt(0) + idx;
      collected.push(item.counter);
    });

    expect(collected).toEqual([97, 99, 101]);
    expect(pool.size).toBe(2);

    let count = 0;
    forEachWithItem(pool, [1, 2], (_item, val) => {
      count += val;
    });
    expect(count).toBe(3);
  });

  it('reduces elements using reduceWithItem cleanly', () => {
    const pool = new ObjectPool(() => ({ sum: 0 }), undefined, 1, 2);

    const total = reduceWithItem(
      pool,
      [1, 2, 3, 4],
      0,
      (acc, item, val) => {
        item.sum = val * 10;
        return acc + item.sum;
      },
    );

    expect(total).toBe(100);
    expect(pool.size).toBe(1);
  });
});
