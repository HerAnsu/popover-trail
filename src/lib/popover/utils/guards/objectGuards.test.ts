import { describe, it, expect } from 'vitest';
import { isPlainObject, isSafeRecord, isPromiseLike, hasSafeProperty } from './objectGuards';

describe('objectGuards', () => {
  it('isPlainObject returns true for literal objects and Object.create(null)', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1, b: 'two' })).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);

    // Rejects non-plain objects
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject(/abc/)).toBe(false);
    expect(isPlainObject(new Map())).toBe(false);
    expect(isPlainObject(new Set())).toBe(false);
    expect(isPlainObject(new Error('fail'))).toBe(false);
    expect(isPlainObject([1, 2, 3])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject('string')).toBe(false);
    expect(isPlainObject(123)).toBe(false);
  });

  it('isSafeRecord rejects objects with prototype pollution keys', () => {
    expect(isSafeRecord({ valid: true, count: 5 })).toBe(true);

    const polluted = JSON.parse('{"__proto__": {"admin": true}}');
    expect(isSafeRecord(polluted)).toBe(false);

    expect(isSafeRecord({ constructor: 'bad' })).toBe(false);
    expect(isSafeRecord({ prototype: 'bad' })).toBe(false);
    expect(isSafeRecord(null)).toBe(false);
  });

  it('isPromiseLike checks for thenable objects and functions', () => {
    expect(isPromiseLike(Promise.resolve(1))).toBe(true);
    /* oxlint-disable-next-line unicorn/no-thenable */
    expect(isPromiseLike({ then: () => {} })).toBe(true);
    /* oxlint-disable-next-line unicorn/no-thenable */
    expect(isPromiseLike({ then: 'not a function' })).toBe(false);
    expect(isPromiseLike(null)).toBe(false);
    expect(isPromiseLike(123)).toBe(false);
  });

  it('hasSafeProperty guards own property existence safely', () => {
    const obj = { foo: 'bar' };
    expect(hasSafeProperty(obj, 'foo')).toBe(true);
    expect(hasSafeProperty(obj, 'bar')).toBe(false);
    expect(hasSafeProperty(obj, '__proto__')).toBe(false);
    expect(hasSafeProperty(obj, 'constructor')).toBe(false);
    expect(hasSafeProperty(null, 'foo')).toBe(false);
  });
});
