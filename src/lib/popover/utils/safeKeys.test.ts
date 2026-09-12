import { describe, it, expect } from 'vitest';
import { isUnsafeKey, areKeysSafe, isValidStorageKey } from './safeKeys';

describe('safeKeys utility', () => {
  it('detects prototype pollution keys', () => {
    expect(isUnsafeKey('__proto__')).toBe(true);
    expect(isUnsafeKey('constructor')).toBe(true);
    expect(isUnsafeKey('prototype')).toBe(true);
    expect(isUnsafeKey('safeKey')).toBe(false);
  });

  it('validates iterable of keys', () => {
    expect(areKeysSafe(['a', 'b', 'c'])).toBe(true);
    expect(areKeysSafe(['a', '__proto__', 'c'])).toBe(false);
    expect(areKeysSafe(['a', '', 'c'])).toBe(false);
  });

  it('validates storage keys', () => {
    expect(isValidStorageKey('my-key')).toBe(true);
    expect(isValidStorageKey('')).toBe(false);
    expect(isValidStorageKey('__proto__')).toBe(false);
  });
});
