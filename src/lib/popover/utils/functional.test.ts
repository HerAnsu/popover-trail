import { describe, it, expect, vi } from 'vitest';
import { identity, noop, constant, pipe, compose } from './functional';

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
});
