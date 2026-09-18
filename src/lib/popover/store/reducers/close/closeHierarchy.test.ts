import { describe, it, expect } from 'vitest';
import { getDirectClosedKeys, shouldIncludeDescendant } from './index';

describe('closeHierarchy module', () => {
  it('collects direct closed keys for floating cards', () => {
    const floating = [{ key: 'f1', isLoading: false }];
    const trail = [{ key: 't1', isLoading: false }];
    const keys = getDirectClosedKeys(floating, trail, 0, true);
    expect(keys).toEqual(['f1']);
  });

  it('collects direct closed keys for trail cards from target index', () => {
    const floating = [{ key: 'f1', isLoading: false }];
    const trail = [
      { key: 't1', isLoading: false },
      { key: 't2', isLoading: false },
    ];
    const keys = getDirectClosedKeys(floating, trail, 2, false);
    expect(keys).toEqual(['t2']);
  });

  it('evaluates shouldIncludeDescendant respecting pinned options', () => {
    expect(shouldIncludeDescendant('k1', true)).toBe(true);
    expect(shouldIncludeDescendant('k1', false, { k1: true })).toBe(false);
    expect(shouldIncludeDescendant('k1', false, { k1: false })).toBe(true);
  });
});
