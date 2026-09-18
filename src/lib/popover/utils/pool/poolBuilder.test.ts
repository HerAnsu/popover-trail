import { describe, it, expect, vi } from 'vitest';
import { poolBuilder } from './poolBuilder';

describe('poolBuilder', () => {
  it('builds ObjectPool fluently with all configuration options', () => {
    const reset = vi.fn((pt: { x: number; y: number }) => {
      pt.x = 0;
      pt.y = 0;
    });
    const onEvict = vi.fn();

    const pool = poolBuilder(() => ({ x: 0, y: 0 }))
      .withReset(reset)
      .withEviction(onEvict)
      .withInitialCapacity(8)
      .withMaxCapacity(32)
      .withIdleDrain(3000)
      .withLeakDetection(true, 5000)
      .build();

    expect(pool.size).toBe(8);
    expect(pool.capacity).toBe(32);

    const item = pool.acquire();
    item.x = 99;
    pool.release(item);

    expect(reset).toHaveBeenCalledWith(item);
    expect(item.x).toBe(0);

    pool.drain(0);
    expect(pool.size).toBe(0);
    expect(onEvict).toHaveBeenCalled();
  });
});
