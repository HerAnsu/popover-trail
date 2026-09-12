import { describe, it, expect } from 'vitest';
import { ObjectPool } from './objectPoolCore';

describe('poolMultiScope', () => {
  it('acquires and releases pair of items cleanly via usePair', () => {
    const pool = new ObjectPool(() => ({ v: 0 }), undefined, 5, 10);
    expect(pool.size).toBe(5);

    const sum = pool.usePair((a, b) => {
      a.v = 10;
      b.v = 20;
      expect(pool.size).toBe(3);
      return a.v + b.v;
    });

    expect(sum).toBe(30);
    expect(pool.size).toBe(5);
  });

  it('guarantees release of both items even when exception is thrown in usePair', () => {
    const pool = new ObjectPool(() => ({ v: 0 }), undefined, 4, 10);

    expect(() => {
      pool.usePair((_a, _b) => {
        throw new Error('Explosion in pair');
      });
    }).toThrow('Explosion in pair');

    expect(pool.size).toBe(4);
  });

  it('acquires and releases triple of items cleanly via useTriple', () => {
    const pool = new ObjectPool(() => ({ id: Math.random() }), undefined, 5, 10);

    const count = pool.useTriple((a, b, c) => {
      expect(a).toBeDefined();
      expect(b).toBeDefined();
      expect(c).toBeDefined();
      expect(pool.size).toBe(2);
      return 3;
    });

    expect(count).toBe(3);
    expect(pool.size).toBe(5);
  });

  it('supports async multi-scoped execution via usePairAsync', async () => {
    const pool = new ObjectPool(() => ({ n: 1 }), undefined, 2, 5);

    const res = await pool.usePairAsync(async (a, b) => {
      await Promise.resolve();
      return a.n + b.n;
    });

    expect(res).toBe(2);
    expect(pool.size).toBe(2);
  });

  it('acquires and releases arbitrary count via useMany with LIFO order', () => {
    const pool = new ObjectPool(() => ({ idx: 0 }), undefined, 6, 10);
    expect(pool.size).toBe(6);

    const result = pool.useMany(4, (items) => {
      expect(items).toHaveLength(4);
      expect(pool.size).toBe(2);
      return items.length * 10;
    });

    expect(result).toBe(40);
    expect(pool.size).toBe(6);
  });

  it('guarantees release of all borrowed items in useMany even on thrown error', () => {
    const pool = new ObjectPool(() => ({ idx: 0 }), undefined, 5, 10);
    expect(pool.size).toBe(5);

    expect(() => {
      pool.useMany(3, (_items) => {
        expect(pool.size).toBe(2);
        throw new Error('Failure in useMany');
      });
    }).toThrow('Failure in useMany');

    expect(pool.size).toBe(5);
  });

  it('provides readable human inspection string with inspect()', () => {
    const pool = new ObjectPool(() => ({ n: 1 }), undefined, 4, 16);
    expect(pool.inspect()).toContain('[ObjectPool size=4/16 inUse=0 hitRate=0%]');
  });
});
