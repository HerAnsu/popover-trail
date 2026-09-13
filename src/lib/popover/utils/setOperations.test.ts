import { describe, it, expect } from 'vitest';
import {
  setUnion,
  setIntersection,
  setDifference,
  setSymmetricDifference,
  isSubset,
  isSuperset,
  isDisjoint,
} from './setOperations';
import { EMPTY_READONLY_SET } from '../types/branded';

describe('setOperations', () => {
  describe('setUnion', () => {
    it('returns original reference when one set is empty or identical', () => {
      const a = new Set(['x', 'y']);
      const empty = new Set<string>();

      expect(setUnion(a, empty)).toBe(a);
      expect(setUnion(empty, a)).toBe(a);
      expect(setUnion(a, a)).toBe(a);
    });

    it('unions elements from both sets and freezes the result', () => {
      const a = new Set(['a', 'b']);
      const b = new Set(['b', 'c']);
      const union = setUnion(a, b);

      expect([...union]).toEqual(['a', 'b', 'c']);
      expect(Object.isFrozen(union)).toBe(true);
    });
  });

  describe('setIntersection', () => {
    it('returns empty singleton or original reference on fast paths', () => {
      const a = new Set(['a', 'b']);
      const empty = new Set<string>();

      expect(setIntersection(a, a)).toBe(a);
      expect(setIntersection(a, empty)).toBe(EMPTY_READONLY_SET);
      expect(setIntersection(empty, a)).toBe(EMPTY_READONLY_SET);
    });

    it('computes intersection iterating smaller set', () => {
      const a = new Set(['a', 'b', 'c']);
      const b = new Set(['b', 'c', 'd']);

      expect([...setIntersection(a, b)]).toEqual(['b', 'c']);
      expect([...setIntersection(b, a)]).toEqual(['b', 'c']);
      expect(setIntersection(new Set(['a']), new Set(['b']))).toBe(EMPTY_READONLY_SET);
    });

    it('returns first set reference when intersection equals both sets', () => {
      const a = new Set(['a', 'b']);
      const b = new Set(['a', 'b']);

      expect(setIntersection(a, b)).toBe(a);
    });
  });

  describe('setDifference', () => {
    it('returns fast paths for empty or identical sets', () => {
      const a = new Set(['a', 'b']);
      const empty = new Set<string>();

      expect(setDifference(a, a)).toBe(EMPTY_READONLY_SET);
      expect(setDifference(empty, a)).toBe(EMPTY_READONLY_SET);
      expect(setDifference(a, empty)).toBe(a);
    });

    it('computes relative complement A \\ B', () => {
      const a = new Set(['a', 'b', 'c']);
      const b = new Set(['b']);

      expect([...setDifference(a, b)]).toEqual(['a', 'c']);
      expect(setDifference(new Set(['a']), new Set(['a']))).toBe(EMPTY_READONLY_SET);
    });

    it('returns original reference when no elements are excluded', () => {
      const a = new Set(['a', 'b']);
      const b = new Set(['c', 'd']);

      expect(setDifference(a, b)).toBe(a);
    });
  });

  describe('setSymmetricDifference', () => {
    it('computes symmetric difference A △ B', () => {
      const a = new Set(['a', 'b']);
      const b = new Set(['b', 'c']);

      expect([...setSymmetricDifference(a, b)]).toEqual(['a', 'c']);
      expect(setSymmetricDifference(a, a)).toBe(EMPTY_READONLY_SET);
      expect(setSymmetricDifference(a, new Set())).toBe(a);
      expect(setSymmetricDifference(new Set(), b)).toBe(b);
    });
  });

  describe('isSubset & isSuperset', () => {
    it('evaluates subset and superset relationships correctly', () => {
      const sub = new Set(['a', 'b']);
      const sup = new Set(['a', 'b', 'c']);
      const disjoint = new Set(['d']);

      expect(isSubset(sub, sup)).toBe(true);
      expect(isSuperset(sup, sub)).toBe(true);
      expect(isSubset(sup, sub)).toBe(false);
      expect(isSuperset(sub, sup)).toBe(false);

      expect(isSubset(new Set(), sup)).toBe(true);
      expect(isSubset(sub, sub)).toBe(true);
      expect(isSubset(disjoint, sup)).toBe(false);
    });
  });

  describe('isDisjoint', () => {
    it('detects disjoint sets accurately', () => {
      const a = new Set(['a', 'b']);
      const b = new Set(['c', 'd']);
      const c = new Set(['b', 'c']);

      expect(isDisjoint(a, b)).toBe(true);
      expect(isDisjoint(a, c)).toBe(false);
      expect(isDisjoint(new Set(), a)).toBe(true);
      expect(isDisjoint(a, a)).toBe(false);
      expect(isDisjoint(new Set(), new Set())).toBe(true);
    });
  });
});
