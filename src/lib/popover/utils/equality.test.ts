import { describe, it, expect } from 'vitest';
import { shallowEqual, isDeepEqual } from './equality';

describe('equality utility functions', () => {
  describe('shallowEqual', () => {
    it('compares primitives correctly', () => {
      expect(shallowEqual(1, 1)).toBe(true);
      expect(shallowEqual('hello', 'hello')).toBe(true);
      expect(shallowEqual(true, false)).toBe(false);
    });

    it('compares objects shallowly', () => {
      expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
      expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it('compares arrays shallowly', () => {
      expect(shallowEqual(['a', 'b'], ['a', 'b'])).toBe(true);
      expect(shallowEqual([1, 2], [1, 2])).toBe(true);
      expect(shallowEqual([1, 2], [1, 3])).toBe(false);
      expect(shallowEqual([1], [1, 2])).toBe(false);
    });
  });

  describe('isDeepEqual', () => {
    it('compares deeply nested objects and arrays', () => {
      expect(isDeepEqual({ a: [1, { b: 'c' }] }, { a: [1, { b: 'c' }] })).toBe(true);
      expect(isDeepEqual({ a: [1, { b: 'c' }] }, { a: [1, { b: 'd' }] })).toBe(false);
    });
  });
});
