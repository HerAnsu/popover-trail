import { describe, it, expect } from 'vitest';
import {
  omitKey,
  omitKeys,
  pickKeys,
  safeAssign,
  isEmptyRecord,
  mapValues,
  filterObject,
  compactObject,
  invertObject,
  deepFreeze,
} from './cleanObject';

describe('cleanObject', () => {
  it('omits key from record without mutation', () => {
    const original = { a: 1, b: 2, c: 3 };
    const result = omitKey(original, 'b');
    expect(result).toEqual({ a: 1, c: 3 });
    expect(original).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('returns original reference when key is absent', () => {
    const original: Record<string, number> = { a: 1 };
    expect(omitKey(original, 'b')).toBe(original);
  });

  it('omits multiple keys via omitKeys', () => {
    const original = { a: 1, b: 2, c: 3, d: 4 };
    const result = omitKeys(original, ['b', 'd']);
    expect(result).toEqual({ a: 1, c: 3 });
    expect(omitKeys(original, new Set(['a', 'c']))).toEqual({ b: 2, d: 4 });
    expect(omitKeys(original, [])).toBe(original);
    expect(omitKeys(null, ['a'])).toEqual({});
  });

  it('safely assigns without prototype pollution', () => {
    const target = { x: 1 };
    const source = JSON.parse('{"y": 2, "__proto__": {"polluted": true}}') as { y: number };
    const result = safeAssign(target, source);
    expect(result.x).toBe(1);
    expect(result.y).toBe(2);
    expect('polluted' in Object.prototype).toBe(false);
  });

  it('picks only specified keys safely ignoring missing or polluted keys', () => {
    const original = { a: 1, b: 2, c: 3 };
    const picked = pickKeys(original, ['a', 'c']);
    expect(picked).toEqual({ a: 1, c: 3 });

    const withPollution = JSON.parse('{"valid": 42, "__proto__": {"bad": true}}') as {
      valid: number;
    };
    const pickedSafe = pickKeys(withPollution, ['valid', '__proto__']);
    expect(pickedSafe).toEqual({ valid: 42 });
    expect('bad' in Object.prototype).toBe(false);
  });

  it('identifies empty records without allocating memory', () => {
    expect(isEmptyRecord({})).toBe(true);
    expect(isEmptyRecord(undefined)).toBe(true);
    expect(isEmptyRecord(null)).toBe(true);
    expect(isEmptyRecord({ a: 1 })).toBe(false);
  });

  it('maps record values while preserving prototype safety', () => {
    const record = { a: 1, b: 2, c: 3 };
    const mapped = mapValues(record, (v) => v * 10);
    expect(mapped).toEqual({ a: 10, b: 20, c: 30 });
    expect(mapValues({}, (v) => v)).toEqual({});
  });

  it('filters record entries while preserving prototype safety', () => {
    const record = { a: 1, b: 2, c: 3, d: 4 };
    const filtered = filterObject(record, (v) => v % 2 === 0);
    expect(filtered).toEqual({ b: 2, d: 4 });
    expect(filterObject({}, () => true)).toEqual({});
  });

  it('compactObject removes null and undefined entries', () => {
    const input = { a: 1, b: null, c: undefined, d: 'valid', e: 0, f: false };
    const output = compactObject(input);
    expect(output).toEqual({ a: 1, d: 'valid', e: 0, f: false });
    expect(compactObject(null)).toEqual({});
    expect(compactObject({})).toEqual({});
  });

  it('invertObject reverses keys and values safely', () => {
    const input = { keyA: 'valA', keyB: 'valB' };
    const inverted = invertObject(input);
    expect(inverted).toEqual({ valA: 'keyA', valB: 'keyB' });
    expect(invertObject(['alpha', 'beta'])).toEqual({ alpha: 0, beta: 1 });
    expect(invertObject(null)).toEqual({});
    expect(invertObject({})).toEqual({});
  });

  it('deepFreeze recursively freezes nested objects and arrays', () => {
    const obj = { nested: { prop: 42 }, arr: [1, 2, 3] };
    const frozen = deepFreeze(obj);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.nested)).toBe(true);
    expect(Object.isFrozen(frozen.arr)).toBe(true);
  });
});
