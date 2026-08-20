import { describe, it, expect } from 'vitest';
import {
  DISPLAY_OPTION_KEYS,
  isDisplayOptionKey,
  extractDisplayOptions,
  mergeDisplayOptions,
  areDisplayOptionsEqual,
} from './displayOptions';
import type { TrailEntry } from '../types';

describe('displayOptions utility', () => {
  it('identifies valid display option keys', () => {
    expect(DISPLAY_OPTION_KEYS).toHaveLength(30);
    expect(isDisplayOptionKey('placement')).toBe(true);
    expect(isDisplayOptionKey('offset')).toBe(true);
    expect(isDisplayOptionKey('onOpen')).toBe(true);
    expect(isDisplayOptionKey('onClose')).toBe(true);
    expect(isDisplayOptionKey('invalidKey')).toBe(false);
  });

  it('extracts defined display options from TrailEntry', () => {
    const entry: Partial<TrailEntry> = {
      key: 'test-card',
      placement: 'top-start',
      offset: 16,
      baseZIndex: 2000,
      enableTilt: true,
      data: { user: 'Alice' },
    };

    const extracted = extractDisplayOptions(entry);
    expect(extracted.placement).toBe('top-start');
    expect(extracted.offset).toBe(16);
    expect(extracted.baseZIndex).toBe(2000);
    expect(extracted.enableTilt).toBe(true);
    expect((extracted as Record<string, unknown>).key).toBeUndefined();
    expect((extracted as Record<string, unknown>).data).toBeUndefined();
  });

  it('returns empty object when extracting from null/undefined', () => {
    expect(extractDisplayOptions(null)).toEqual({});
    expect(extractDisplayOptions(undefined)).toEqual({});
  });

  it('merges display options with overrides', () => {
    const base = { placement: 'top' as const, offset: 10, baseZIndex: 1000 };
    const overrides = { offset: 25, enableTilt: true };

    const merged = mergeDisplayOptions(base, overrides);
    expect(merged.placement).toBe('top');
    expect(merged.offset).toBe(25);
    expect(merged.baseZIndex).toBe(1000);
    expect(merged.enableTilt).toBe(true);
  });

  it('checks equality between display options sets', () => {
    const optsA = { placement: 'bottom' as const, offset: 12 };
    const optsB = { placement: 'bottom' as const, offset: 12 };
    const optsC = { placement: 'bottom' as const, offset: 20 };

    expect(areDisplayOptionsEqual(optsA, optsB)).toBe(true);
    expect(areDisplayOptionsEqual(optsA, optsC)).toBe(false);
    expect(areDisplayOptionsEqual(null, null)).toBe(true);
    expect(areDisplayOptionsEqual(optsA, null)).toBe(false);
  });
});
