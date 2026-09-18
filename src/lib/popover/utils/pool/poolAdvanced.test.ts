import { describe, it, expect, vi } from 'vitest';
import { Pool } from './pool';
import { KeyedPool } from './keyedPool';
import { DISPOSE_SYMBOL } from '../resource/disposableTypes';

describe('Pool Advanced DX & Clean Code Features', () => {
  describe('pool.borrowMany', () => {
    it('acquires a typed tuple of pooled items with collective RAII disposal', () => {
      const pool = Pool.create(() => ({ id: Math.random(), val: 0 }));
      const items = pool.borrowMany(3);

      expect(items).toHaveLength(3);
      expect(pool.inUse).toBe(3);
      expect(items.isDisposed).toBe(false);

      items[0].val = 10;
      items[1].val = 20;
      items[2].val = 30;

      items.dispose();
      expect(items.isDisposed).toBe(true);
      expect(pool.inUse).toBe(0);

      // Idempotent disposal check
      expect(typeof items[DISPOSE_SYMBOL]).toBe('function');
      items.dispose();
      expect(pool.inUse).toBe(0);
    });
  });

  describe('pool.prewarm', () => {
    it('pre-warms dynamic pool storage for zero-allocation hot paths', () => {
      const pool = Pool.create(() => ({ x: 0, y: 0 }), { initialCapacity: 2 }).prewarm(10);
      expect(pool.size).toBe(10);
      expect(pool.inUse).toBe(0);

      const pt = pool.acquire();
      expect(pool.inUse).toBe(1);
      expect(pool.size).toBe(9);
      pool.release(pt);
      expect(pool.size).toBe(10);
    });

    it('pre-warms fixed pool slots if cleared', () => {
      const fixed = Pool.fixed(() => ({ data: '' }), 8);
      fixed.clear();
      expect(fixed.size).toBe(0);

      fixed.prewarm(6);
      expect(fixed.size).toBe(6);
    });
  });

  describe('resetOn policy', () => {
    it('executes reset on acquire when resetOn is acquire', () => {
      const resetFn = vi.fn((obj: { count: number }) => {
        obj.count = 0;
      });

      const pool = Pool.create(() => ({ count: 100 }), {
        reset: resetFn,
        resetOn: 'acquire',
      });

      expect(resetFn).not.toHaveBeenCalled();

      const item = pool.acquire();
      expect(resetFn).toHaveBeenCalledTimes(1);
      expect(item.count).toBe(0);

      item.count = 42;
      pool.release(item);
      // resetOn: 'acquire' must NOT reset on release
      expect(resetFn).toHaveBeenCalledTimes(1);
      expect(item.count).toBe(42);
    });

    it('executes reset on both acquire and release when resetOn is both', () => {
      const resetFn = vi.fn((obj: { val: number }) => {
        obj.val = 0;
      });

      const pool = Pool.create(() => ({ val: 99 }), {
        reset: resetFn,
        resetOn: 'both',
      });

      const item = pool.acquire();
      expect(resetFn).toHaveBeenCalledTimes(1);

      pool.release(item);
      expect(resetFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('KeyedPool parity enhancements', () => {
    it('supports keyedPool.borrow with RAII disposal', () => {
      const keyed = new KeyedPool((key: string) => ({ category: key, active: false }));
      const handle = keyed.borrow('ui');

      expect(handle.category).toBe('ui');
      expect(handle.isDisposed).toBe(false);

      handle.dispose();
      expect(handle.isDisposed).toBe(true);
    });

    it('supports keyedPool.borrowMany and prewarm', () => {
      const keyed = new KeyedPool((size: number) => new Float32Array(size));
      keyed.prewarm(16, 4);

      const items = keyed.borrowMany(16, 2);
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveLength(16);
      expect(items[1]).toHaveLength(16);

      items.dispose();
      expect(items.isDisposed).toBe(true);
    });

    it('supports variadic tuple scopes in keyedPool.use', () => {
      const keyed = new KeyedPool((size: number) => ({ len: size }));
      const result = keyed.use(32, 2, ([a, b]) => a.len + b.len);
      expect(result).toBe(64);
    });
  });
});
