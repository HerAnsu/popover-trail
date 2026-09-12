import { describe, it, expect, vi } from 'vitest';
import { KeyedPool } from './keyedPool';
import { DISPOSE_SYMBOL } from '../disposable';

describe('keyedPool', () => {
  it('partitions pooled objects by key on demand', () => {
    const factory = vi.fn((key: string) => ({ key, data: [] as number[] }));
    const pool = new KeyedPool(factory);

    expect(pool.partitionCount).toBe(0);
    expect(pool.hasPool('small')).toBe(false);

    const itemA = pool.acquire('small');
    expect(pool.hasPool('small')).toBe(true);
    expect(pool.partitionCount).toBe(1);
    expect(itemA.key).toBe('small');

    const itemB = pool.acquire('large');
    expect(pool.partitionCount).toBe(2);
    expect(itemB.key).toBe('large');

    pool.release('small', itemA);
    pool.release('large', itemB);

    const reacquired = pool.acquire('small');
    expect(reacquired).toBe(itemA);
  });

  it('runs scoped execution with runWith and use', () => {
    const pool = new KeyedPool((key: number) => ({ len: key, buffer: new Uint8Array(key) }));

    const res = pool.use(16, (buf) => {
      expect(buf.len).toBe(16);
      expect(pool.getPool(16).inUse).toBe(1);
      return buf.buffer.byteLength;
    });

    expect(res).toBe(16);
    expect(pool.getPool(16).inUse).toBe(0);
  });

  it('aggregates metrics across all partitions', () => {
    const pool = new KeyedPool((tier: string) => ({ tier }));
    pool.acquire('t1');
    pool.acquire('t2');

    const all = pool.getAllMetrics();
    expect(all.size).toBe(2);
    expect(all.has('t1')).toBe(true);
    expect(all.has('t2')).toBe(true);
    expect(pool.getMetrics('t1')?.hits).toBe(1);
    expect(pool.getMetrics('t1')?.inUse).toBe(1);
  });

  it('drains and disposes all partitions cleanly', () => {
    const onEvict = vi.fn();
    const pool = new KeyedPool(
      (k: string) => ({ k }),
      { factory: () => ({ k: '' }), onEvict, initialCapacity: 2 },
    );

    const a = pool.acquire('k1');
    expect(pool.getPool('k1').size).toBe(1);
    pool.release('k1', a);
    expect(pool.getPool('k1').size).toBe(2);

    pool.drainAll(0);
    expect(pool.getPool('k1').size).toBe(0);
    expect(onEvict).toHaveBeenCalled();

    pool.dispose();
    expect(pool.partitionCount).toBe(0);
  });

  it('implements DISPOSE_SYMBOL contract', () => {
    const pool = new KeyedPool((k: string) => ({ k }));
    pool.acquire('temp');
    expect(pool.partitionCount).toBe(1);

    pool[DISPOSE_SYMBOL]?.();
    expect(pool.partitionCount).toBe(0);
  });
});
