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

  it('clones Date, RegExp, Map, and Set objects', () => {
    const date = new Date(1600000000000);
    const dateClone = fastClone(date);
    expect(dateClone).toEqual(date);
    expect(dateClone).not.toBe(date);

    const regex = /test-[a-z]+/gi;
    const regexClone = fastClone(regex);
    expect(regexClone.source).toBe(regex.source);
    expect(regexClone.flags).toBe(regex.flags);
    expect(regexClone).not.toBe(regex);

    const map = new Map([['k1', { val: 1 }]]);
    const mapClone = fastClone(map);
    expect(mapClone.get('k1')).toEqual({ val: 1 });
    expect(mapClone.get('k1')).not.toBe(map.get('k1'));

    const set = new Set([{ id: 1 }]);
    const setClone = fastClone(set);
    expect(setClone.size).toBe(1);
    expect(setClone).not.toBe(set);
  });
});
