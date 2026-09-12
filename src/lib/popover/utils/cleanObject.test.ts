import { describe, it, expect } from 'vitest';
import { omitRecordKey, pickRecordKeys, safeAssign } from './cleanObject';

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
});
