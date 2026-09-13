import { describe, it, expect } from 'vitest';
import {
  isKeyInList,
  isPopoverActive,
  shouldTrackFloatingGeometry,
  hasAnimationClassNamesChanged,
  isNonNullable,
  isDefined,
  isNull,
  isUndefined,
} from './predicates';

describe('predicates utility', () => {
  it('checks if key is in list', () => {
    const list = [{ key: 'a' }, { key: 'b' }];
    expect(isKeyInList(list, 'a')).toBe(true);
    expect(isKeyInList(list, 'c')).toBe(false);
  });

  it('checks if popover is active in trail or floating', () => {
    const state = {
      trail: [{ key: 'card-1' }],
      floating: [{ key: 'card-2' }],
    };
    expect(isPopoverActive(state, 'card-1')).toBe(true);
    expect(isPopoverActive(state, 'card-2')).toBe(true);
    expect(isPopoverActive(state, 'card-3')).toBe(false);
  });

  it('checks floating geometry tracking condition', () => {
    expect(shouldTrackFloatingGeometry(true, false)).toBe(true);
    expect(shouldTrackFloatingGeometry(false, true)).toBe(true);
    expect(shouldTrackFloatingGeometry(false, false)).toBe(false);
  });

  it('detects changes in animation class names', () => {
    expect(hasAnimationClassNamesChanged(undefined, undefined)).toBe(false);
    expect(
      hasAnimationClassNamesChanged(
        { mountingClassName: 'fade-in' },
        { mountingClassName: 'fade-in' },
      ),
    ).toBe(false);
    expect(
      hasAnimationClassNamesChanged(
        { mountingClassName: 'fade-in' },
        { mountingClassName: 'slide-in' },
      ),
    ).toBe(true);
  });

  it('narrows non-null and defined values with isNonNullable and isDefined', () => {
    expect(isNonNullable('hello')).toBe(true);
    expect(isNonNullable(0)).toBe(true);
    expect(isNonNullable(false)).toBe(true);
    expect(isNonNullable(null)).toBe(false);
    expect(isNonNullable(undefined)).toBe(false);

    expect(isDefined(0)).toBe(true);
    expect(isDefined(null)).toBe(true);
    expect(isDefined(undefined)).toBe(false);
  });

  it('identifies null and undefined with isNull and isUndefined', () => {
    expect(isNull(null)).toBe(true);
    expect(isNull(undefined)).toBe(false);
    expect(isNull(0)).toBe(false);

    expect(isUndefined(undefined)).toBe(true);
    expect(isUndefined(null)).toBe(false);
    expect(isUndefined('')).toBe(false);
  });
});

