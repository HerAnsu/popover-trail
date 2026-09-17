import { describe, it, expect } from 'vitest';
import { first, last, take, drop, concatImmutable } from './arrayUtils';
import { EMPTY_ARRAY } from '../types/branded';

describe('arrayUtils', () => {
  describe('first and last', () => {
    it('returns first element or undefined', () => {
      expect(first([1, 2, 3])).toBe(1);
      expect(first([])).toBeUndefined();
    });

    it('returns last element or undefined', () => {
      expect(last([1, 2, 3])).toBe(3);
      expect(last([])).toBeUndefined();
    });
  });

  describe('take', () => {
    it('returns EMPTY_ARRAY for count <= 0 or empty array', () => {
      expect(take([1, 2, 3], 0)).toBe(EMPTY_ARRAY);
      expect(take([1, 2, 3], -2)).toBe(EMPTY_ARRAY);
      expect(take([], 5)).toBe(EMPTY_ARRAY);
    });

    it('returns original array reference if count >= items.length', () => {
      const arr = [1, 2, 3];
      expect(take(arr, 3)).toBe(arr);
      expect(take(arr, 10)).toBe(arr);
    });

    it('returns frozen sliced array when 0 < count < length', () => {
      const arr = [10, 20, 30, 40];
      const result = take(arr, 2);
      expect(result).toEqual([10, 20]);
      expect(Object.isFrozen(result)).toBe(true);
    });
  });

  describe('drop', () => {
    it('returns original array for count <= 0 or empty array', () => {
      const arr = [1, 2, 3];
      expect(drop(arr, 0)).toBe(arr);
      expect(drop(arr, -1)).toBe(arr);
      expect(drop([], 2)).toEqual([]);
    });

    it('returns EMPTY_ARRAY if count >= items.length', () => {
      expect(drop([1, 2, 3], 3)).toBe(EMPTY_ARRAY);
      expect(drop([1, 2, 3], 5)).toBe(EMPTY_ARRAY);
    });

    it('returns frozen dropped array when 0 < count < length', () => {
      const arr = [10, 20, 30, 40];
      const result = drop(arr, 2);
      expect(result).toEqual([30, 40]);
      expect(Object.isFrozen(result)).toBe(true);
    });
  });

  describe('concatImmutable', () => {
    it('returns EMPTY_ARRAY if all input arrays are empty', () => {
      expect(concatImmutable([], [], [])).toBe(EMPTY_ARRAY);
    });

    it('returns the exact instance without allocation if only one array is non-empty', () => {
      const single = [1, 2, 3];
      expect(concatImmutable([], single, [])).toBe(single);
    });

    it('concatenates multiple non-empty arrays into a frozen array', () => {
      const a = [1, 2];
      const b = [3, 4];
      const c = [5];
      const result = concatImmutable(a, b, c);
      expect(result).toEqual([1, 2, 3, 4, 5]);
      expect(Object.isFrozen(result)).toBe(true);
    });
  });
});
