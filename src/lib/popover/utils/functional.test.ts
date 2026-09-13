import { describe, it, expect, vi } from 'vitest';
import {
  identity,
  noop,
  constant,
  pipe,
  compose,
  curry2,
  prop,
  propEq,
  and,
  or,
  not,
} from './functional';

describe('functional combinators', () => {
  it('identity returns the input unchanged', () => {
    const obj = { id: 1 };
    expect(identity(obj)).toBe(obj);
    expect(identity('hello')).toBe('hello');
    expect(identity(42)).toBe(42);
  });

  it('noop returns undefined and does not throw', () => {
    expect(noop()).toBeUndefined();
  });

  it('constant returns a function always returning the specified value', () => {
    const fn = constant(100);
    expect(fn()).toBe(100);
    expect(fn()).toBe(100);
  });

  describe('pipe', () => {
    it('returns original value when called with no functions', () => {
      expect(pipe(5)).toBe(5);
    });

    it('evaluates functions from left to right', () => {
      const double = (n: number) => n * 2;
      const addTen = (n: number) => n + 10;
      const toString = (n: number) => `value: ${n}`;

      const res = pipe(5, double, addTen, toString);
      expect(res).toBe('value: 20');
    });

    it('handles up to 7 pipe steps with complete type inference', () => {
      const step1 = (x: number) => x + 1;
      const step2 = (x: number) => x * 2;
      const step3 = (x: number) => x - 3;
      const step4 = (x: number) => String(x);
      const step5 = (x: string) => x.length;
      const step6 = (x: number) => x > 0;

      expect(pipe(10, step1, step2, step3, step4, step5, step6)).toBe(true);
    });
  });

  describe('compose', () => {
    it('composes functions from right to left', () => {
      const double = (n: number) => n * 2;
      const addTen = (n: number) => n + 10;

      const composed = compose(double, addTen);
      expect(composed(5)).toBe(30); // (5 + 10) * 2 = 30
    });

    it('works with single function', () => {
      const fn = vi.fn((x: number) => x * 3);
      const composed = compose(fn);
      expect(composed(4)).toBe(12);
    });
  });

  describe('curry2', () => {
    it('curries binary function into unary functions', () => {
      const add = curry2((a: number, b: number) => a + b);
      const add5 = add(5);
      expect(add5(3)).toBe(8);
      expect(add(10)(20)).toBe(30);
    });
  });

  describe('prop and propEq', () => {
    interface TestItem {
      readonly id: string;
      readonly count: number;
    }

    it('prop extracts property accurately', () => {
      const getId = prop<TestItem, 'id'>('id');
      const getCount = prop<TestItem, 'count'>('count');
      const item: TestItem = { id: 'test-1', count: 42 };

      expect(getId(item)).toBe('test-1');
      expect(getCount(item)).toBe(42);
    });

    it('propEq matches property equality', () => {
      const isTest1 = propEq<TestItem, 'id'>('id', 'test-1');
      const isCount42 = propEq<TestItem, 'count'>('count', 42);

      const item: TestItem = { id: 'test-1', count: 42 };
      const other: TestItem = { id: 'test-2', count: 0 };

      expect(isTest1(item)).toBe(true);
      expect(isTest1(other)).toBe(false);
      expect(isCount42(item)).toBe(true);
      expect(isCount42(other)).toBe(false);
    });
  });

  describe('predicate combinators (and, or, not)', () => {
    const isPositive = (n: number) => n > 0;
    const isEven = (n: number) => n % 2 === 0;

    it('and requires all predicates to be satisfied', () => {
      const isPositiveEven = and(isPositive, isEven);
      expect(isPositiveEven(4)).toBe(true);
      expect(isPositiveEven(3)).toBe(false);
      expect(isPositiveEven(-2)).toBe(false);
    });

    it('or requires at least one predicate to be satisfied', () => {
      const isPositiveOrEven = or(isPositive, isEven);
      expect(isPositiveOrEven(4)).toBe(true);
      expect(isPositiveOrEven(3)).toBe(true);
      expect(isPositiveOrEven(-2)).toBe(true);
      expect(isPositiveOrEven(-3)).toBe(false);
    });

    it('not inverts predicate result', () => {
      const isNotPositive = not(isPositive);
      expect(isNotPositive(-5)).toBe(true);
      expect(isNotPositive(0)).toBe(true);
      expect(isNotPositive(5)).toBe(false);
    });
  });
});

