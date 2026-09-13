import { describe, it, expect } from 'vitest';
import {
  omitRecordKey,
  pickRecordKeys,
  safeAssign,
  isEmptyRecord,
  mapRecordValues,
  filterRecord,
  compactRecord,
  invertRecord,
  freezeDeep,
} from './cleanObject';

describe('cleanObject', () => {
  it('omits key from record without mutation', () => {
    const original = { a: 1, b: 2, c: 3 };
    const result = omitRecordKey(original, 'b');
    expect(result).toEqual({ a: 1, c: 3 });
    expect(original).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('returns original reference when key is absent', () => {
    const original: Record<string, number> = { a: 1 };
    expect(omitRecordKey(original, 'b')).toBe(original);
  });

  it('safely assigns without prototype pollution', () => {
    const target = { x: 1 };
    const source = JSON.parse('{"y": 2, "__proto__": {"polluted": true}}') as Record<
      string,
      unknown
    >;
    const result = safeAssign(target, source);
    expect(result.x).toBe(1);
    expect(result.y).toBe(2);
    expect('polluted' in Object.prototype).toBe(false);
  });

  it('picks only specified keys safely ignoring missing or polluted keys', () => {
    const original = { a: 1, b: 2, c: 3 };
    const picked = pickRecordKeys(original, ['a', 'c']);
    expect(picked).toEqual({ a: 1, c: 3 });

    const withPollution = JSON.parse('{"valid": 42, "__proto__": {"bad": true}}') as Record<
      string,
      unknown
    >;
    const pickedSafe = pickRecordKeys(withPollution, ['valid', '__proto__']);
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
    const mapped = mapRecordValues(record, (v) => v * 10);
    expect(mapped).toEqual({ a: 10, b: 20, c: 30 });
    expect(mapRecordValues({}, (v) => v)).toEqual({});
  });

  it('filters record entries while preserving prototype safety', () => {
    const record = { a: 1, b: 2, c: 3, d: 4 };
    const filtered = filterRecord(record, (v) => v % 2 === 0);
    expect(filtered).toEqual({ b: 2, d: 4 });
    expect(filterRecord({}, () => true)).toEqual({});
  });

  it('compactRecord removes null and undefined entries', () => {
    const input = { a: 1, b: null, c: undefined, d: 'valid', e: 0, f: false };
    const output = compactRecord(input);
    expect(output).toEqual({ a: 1, d: 'valid', e: 0, f: false });
    expect(compactRecord(null)).toEqual({});
    expect(compactRecord({})).toEqual({});
  });

  it('invertRecord reverses keys and values safely', () => {
    const input = { keyA: 'valA', keyB: 'valB' };
    const inverted = invertRecord(input);
    expect(inverted).toEqual({ valA: 'keyA', valB: 'keyB' });
    expect(invertRecord(null)).toEqual({});
    expect(invertRecord({})).toEqual({});
  });

  it('freezeDeep recursively freezes nested objects and arrays', () => {
    const obj = { nested: { prop: 42 }, arr: [1, 2, 3] };
    const frozen = freezeDeep(obj);
    expect(Object.isFrozen(frozen)).toBe(true);
    expect(Object.isFrozen(frozen.nested)).toBe(true);
    expect(Object.isFrozen(frozen.arr)).toBe(true);
  });
});
