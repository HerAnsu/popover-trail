import { describe, it, expect, vi } from 'vitest';
import { memoizeOne, memoizeWeak } from './memoize';

describe('memoization utilities', () => {
  describe('memoizeOne', () => {
    it('caches the last result when called with identical arguments', () => {
      const spy = vi.fn((a: number, b: number) => a + b);
      const memoized = memoizeOne(spy);

      expect(memoized(2, 3)).toBe(5);
      expect(spy).toHaveBeenCalledTimes(1);

      expect(memoized(2, 3)).toBe(5);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('recomputes when arguments change', () => {
      const spy = vi.fn((a: number, b: number) => a + b);
      const memoized = memoizeOne(spy);

      expect(memoized(1, 2)).toBe(3);
      expect(memoized(2, 3)).toBe(5);
      expect(spy).toHaveBeenCalledTimes(2);

      // Reverting to previous arguments recomputes because capacity is 1
      expect(memoized(1, 2)).toBe(3);
      expect(spy).toHaveBeenCalledTimes(3);
    });

    it('supports custom equality comparators', () => {
      const spy = vi.fn((items: readonly string[]) => items.length);
      const memoized = memoizeOne(spy, (newArgs, lastArgs) => {
        return newArgs[0]?.length === lastArgs[0]?.length;
      });

      expect(memoized(['a', 'b'])).toBe(2);
      expect(memoized(['x', 'y'])).toBe(2);
      expect(spy).toHaveBeenCalledTimes(1);

      expect(memoized(['x', 'y', 'z'])).toBe(3);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('clears cached result when clear() is called', () => {
      const spy = vi.fn((x: number) => x * 2);
      const memoized = memoizeOne(spy);

      expect(memoized(5)).toBe(10);
      expect(spy).toHaveBeenCalledTimes(1);

      memoized.clear();

      expect(memoized(5)).toBe(10);
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });

  describe('memoizeWeak', () => {
    it('caches computed results per object key', () => {
      const spy = vi.fn((obj: { id: string }) => obj.id.toUpperCase());
      const memoized = memoizeWeak(spy);

      const a = { id: 'card-1' };
      const b = { id: 'card-2' };

      expect(memoized(a)).toBe('CARD-1');
      expect(memoized(a)).toBe('CARD-1');
      expect(spy).toHaveBeenCalledTimes(1);

      expect(memoized(b)).toBe('CARD-2');
      expect(spy).toHaveBeenCalledTimes(2);

      expect(memoized(a)).toBe('CARD-1');
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it('allows explicit key deletion via delete()', () => {
      const spy = vi.fn((obj: { id: string }) => obj.id);
      const memoized = memoizeWeak(spy);

      const a = { id: 'card-1' };
      expect(memoized(a)).toBe('card-1');
      expect(spy).toHaveBeenCalledTimes(1);

      expect(memoized.delete(a)).toBe(true);

      expect(memoized(a)).toBe('card-1');
      expect(spy).toHaveBeenCalledTimes(2);
    });
  });
});
