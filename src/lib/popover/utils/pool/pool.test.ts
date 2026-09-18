import { describe, it, expect } from 'vitest';
import { Pool } from './pool';
import { DISPOSE_SYMBOL } from '../resource/disposableTypes';

describe('Unified Pool<T>', () => {
  describe('Pool.create (dynamic mode)', () => {
    it('acquires and releases items properly', () => {
      const pool = Pool.create(() => ({ x: 0, y: 0 }), {
        reset: (pt) => { pt.x = 0; pt.y = 0; },
      });

      const pt = pool.acquire();
      pt.x = 10;
      pt.y = 20;
      expect(pool.inUse).toBe(1);

      pool.release(pt);
      expect(pt.x).toBe(0);
      expect(pt.y).toBe(0);
      expect(pool.inUse).toBe(0);
    });

    it('provides telemetry metrics', () => {
      const pool = Pool.create(() => ({ id: Math.random() }));
      const item = pool.acquire();
      pool.release(item);
      const metrics = pool.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics?.allocated).toBeGreaterThanOrEqual(1);
      expect(metrics?.hits).toBeDefined();
    });
  });

  describe('Pool.fixed (fixed slab mode)', () => {
    it('creates pre-allocated fixed pool without runtime expansion', () => {
      const pool = Pool.fixed(() => ({ val: 42 }), 4);
      expect(pool.capacity).toBe(4);
      expect(pool.size).toBe(4);

      const item1 = pool.acquire();
      const item2 = pool.acquire();
      expect(pool.size).toBe(2);
      expect(pool.inUse).toBe(2);

      pool.release(item1);
      pool.release(item2);
      expect(pool.size).toBe(4);
      expect(pool.inUse).toBe(0);
    });
  });

  describe('Pool.keyed (partitioned mode)', () => {
    it('partitions pools by key', () => {
      const keyed = Pool.keyed((size: number) => new Float32Array(size));
      const arr16 = keyed.acquire(16);
      const arr64 = keyed.acquire(64);

      expect(arr16).toHaveLength(16);
      expect(arr64).toHaveLength(64);
      expect(keyed.partitionCount).toBe(2);

      keyed.release(16, arr16);
      keyed.release(64, arr64);
    });
  });

  describe('pool.borrow() and RAII Symbol.dispose (using)', () => {
    it('attaches Symbol.dispose and dispose() to the borrowed object', () => {
      const pool = Pool.create(() => ({ name: 'test' }));
      const item = pool.borrow();

      expect(pool.inUse).toBe(1);
      expect(item.isDisposed).toBe(false);
      expect(typeof item[DISPOSE_SYMBOL]).toBe('function');
      expect(typeof item.dispose).toBe('function');

      // Manual or 'using' disposal
      item.dispose();
      expect(item.isDisposed).toBe(true);
      expect(pool.inUse).toBe(0);

      // Idempotent disposal
      item.dispose();
      expect(pool.inUse).toBe(0);
    });
  });

  describe('pool.use (variadic scopes)', () => {
    it('executes single item scope and releases on completion', () => {
      const pool = Pool.create(() => ({ count: 0 }));
      const res = pool.use((item) => {
        item.count = 5;
        expect(pool.inUse).toBe(1);
        return item.count * 2;
      });

      expect(res).toBe(10);
      expect(pool.inUse).toBe(0);
    });

    it('executes tuple scope for N items with automatic release', () => {
      const pool = Pool.create(() => ({ x: 0, y: 0 }));
      const dist = pool.use(2, ([p1, p2]) => {
        expect(pool.inUse).toBe(2);
        p1.x = 0; p1.y = 0;
        p2.x = 3; p2.y = 4;
        return Math.hypot(p2.x - p1.x, p2.y - p1.y);
      });

      expect(dist).toBe(5);
      expect(pool.inUse).toBe(0);
    });

    it('releases items even if an error is thrown in use()', () => {
      const pool = Pool.create(() => ({ active: true }));
      expect(() => {
        pool.use(3, ([_a, _b, _c]) => {
          expect(pool.inUse).toBe(3);
          throw new Error('Failure inside scope');
        });
      }).toThrow('Failure inside scope');

      expect(pool.inUse).toBe(0);
    });

    it('executes async tuple scope and releases on promise resolution or rejection', async () => {
      const pool = Pool.create(() => ({ data: '' }));
      const sum = await pool.useAsync(2, async ([a, b]) => {
        expect(pool.inUse).toBe(2);
        await new Promise((resolve) => setTimeout(resolve, 5));
        a.data = 'hello';
        b.data = 'world';
        return `${a.data} ${b.data}`;
      });

      expect(sum).toBe('hello world');
      expect(pool.inUse).toBe(0);

      await expect(
        pool.useAsync(2, async () => {
          throw new Error('Async error');
        }),
      ).rejects.toThrow('Async error');

      expect(pool.inUse).toBe(0);
    });
  });
});
