import { describe, it, expect } from 'vitest';
import { Pool } from './pool';
import { RingBuffer } from '../buffer/ringBufferCore';

describe('Pool Advanced DX Extensions', () => {
  describe('pool.borrowWith', () => {
    it('initializes acquired item and attaches RAII disposal handle', () => {
      const pool = Pool.create(() => ({ x: 0, y: 0, tag: '' }));
      const item = pool.borrowWith((pt) => {
        pt.x = 10;
        pt.y = 20;
        pt.tag = 'active';
      });

      expect(item.x).toBe(10);
      expect(item.y).toBe(20);
      expect(item.tag).toBe('active');
      expect(pool.inUse).toBe(1);

      item.dispose();
      expect(pool.inUse).toBe(0);
    });
  });

  describe('pool.drainActive', () => {
    it('forcefully reclaims all active unreturned handles', () => {
      const pool = Pool.create(() => ({ active: true }));
      pool.borrow();
      pool.borrow();
      pool.acquire();

      expect(pool.inUse).toBe(3);

      const reclaimed = pool.drainActive();
      expect(reclaimed).toBe(3);
      expect(pool.inUse).toBe(0);

      // Subsequent call should be a no-op returning 0
      expect(pool.drainActive()).toBe(0);
    });

    it('drainActive is invoked automatically on pool.dispose()', () => {
      const pool = Pool.create(() => ({ id: Math.random() }));
      pool.borrow();
      expect(pool.inUse).toBe(1);

      pool.dispose();
      expect(pool.inUse).toBe(0);
    });
  });

  describe('Pool.bucketed', () => {
    it('provides acquireBucket and borrowBucket with tiered sizing', () => {
      const bucketPool = Pool.bucketed(
        [16, 64, 256],
        (size) => new Float32Array(size),
        (arr) => arr.fill(0),
      );

      const buf = bucketPool.acquireBucket(50);
      expect(buf).toHaveLength(64);
      bucketPool.release(64, buf);

      const borrowed = bucketPool.borrowBucket(20);
      expect(borrowed).toHaveLength(64);
      borrowed[0] = 99;
      borrowed.dispose();

      const recycled = bucketPool.acquireBucket(20);
      expect(recycled).toBe(borrowed);
      expect(recycled[0]).toBe(0); // reset verified
    });
  });

  describe('Pool.ringBuffer', () => {
    it('vends RingBuffer instances and clears them upon return', () => {
      const pool = Pool.ringBuffer<string>(4);
      const ring = pool.borrow();

      expect(ring).toBeInstanceOf(RingBuffer);
      expect(ring.capacity).toBe(4);

      ring.push('a').push('b').push('c');
      expect(ring.size).toBe(3);

      ring.dispose();
      expect(pool.inUse).toBe(0);

      const reused = pool.acquire();
      expect(reused).toBe(ring);
      expect(reused.size).toBe(0);
      expect(reused.isEmpty).toBe(true);
    });
  });
});