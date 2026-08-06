import { describe, it, expect } from 'vitest';
import { fastClone } from './clone';

describe('clone utility (fastClone)', () => {
  it('returns primitives as is', () => {
    expect(fastClone(null)).toBeNull();
    expect(fastClone(undefined)).toBeUndefined();
    expect(fastClone(42)).toBe(42);
    expect(fastClone('string')).toBe('string');
    expect(fastClone(true)).toBe(true);
  });

  it('deeply clones plain objects and arrays', () => {
    const original = { a: 1, b: [2, 3], c: { d: 'test' } };
    const cloned = fastClone(original);

    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.b).not.toBe(original.b);
    expect(cloned.c).not.toBe(original.c);
  });

  it('falls back safely when structuredClone throws on non-cloneables', () => {
    const fn = () => {};
    const objWithFn = { a: 10, fn };
    const cloned = fastClone(objWithFn);

    expect(cloned.a).toBe(10);
    expect(cloned).not.toBe(objWithFn);
  });
});
