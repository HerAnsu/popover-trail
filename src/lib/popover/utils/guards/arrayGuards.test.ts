import { describe, it, expect, expectTypeOf } from 'vitest';
import { isArray, isNonEmptyArray, isIterable } from './arrayGuards';

describe('arrayGuards', () => {
  it('verifies isArray returns true for arrays and narrows to readonly array', () => {
    const mutableNumbers: unknown = [1, 2, 3];
    const readonlyStrings: readonly string[] = ['a', 'b'];
    const notAnArray: unknown = { 0: 'a', length: 1 };

    expect(isArray(mutableNumbers)).toBe(true);
    expect(isArray(readonlyStrings)).toBe(true);
    expect(isArray(notAnArray)).toBe(false);
    expect(isArray(null)).toBe(false);
    expect(isArray(undefined)).toBe(false);

    if (isArray<number>(mutableNumbers)) {
      expectTypeOf(mutableNumbers).toEqualTypeOf<readonly number[]>();
      expect(mutableNumbers).toHaveLength(3);
    }
  });

  it('verifies isNonEmptyArray returns true only for non-empty arrays', () => {
    const empty: readonly number[] = [];
    const populated: readonly string[] = ['first', 'second'];

    expect(isNonEmptyArray(empty)).toBe(false);
    expect(isNonEmptyArray(populated)).toBe(true);
    expect(isNonEmptyArray('string')).toBe(false);
    expect(isNonEmptyArray(null)).toBe(false);

    if (isNonEmptyArray(populated)) {
      expectTypeOf(populated).toEqualTypeOf<readonly [string, ...string[]]>();
      expect(populated[0]).toBe('first');
    }
  });

  it('verifies isIterable returns true for arrays, sets, maps and custom iterables', () => {
    expect(isIterable([1, 2, 3])).toBe(true);
    expect(isIterable(new Set([1, 2]))).toBe(true);
    expect(isIterable(new Map())).toBe(true);
    expect(isIterable('string')).toBe(false);
    expect(isIterable(null)).toBe(false);
    expect(isIterable(undefined)).toBe(false);
    expect(isIterable({ length: 0 })).toBe(false);
  });
});
