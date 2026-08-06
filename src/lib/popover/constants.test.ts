import { describe, it, expect } from 'vitest';
import {
  DEFAULT_POPOVER_SELECTOR,
  DEFAULT_BASE_Z_INDEX,
  DEFAULT_CASCADE_STEP,
  VALID_PLACEMENTS_SET,
  FOCUSABLE_ELEMENTS_SELECTOR,
} from './constants';

describe('constants module', () => {
  it('defines valid domain configuration defaults', () => {
    expect(DEFAULT_POPOVER_SELECTOR).toBe('.popover-card');
    expect(DEFAULT_BASE_Z_INDEX).toBe(1000);
    expect(DEFAULT_CASCADE_STEP).toBe(24);
  });

  it('contains valid placement set values', () => {
    expect(VALID_PLACEMENTS_SET.has('bottom')).toBe(true);
    expect(VALID_PLACEMENTS_SET.has('top-start')).toBe(true);
    expect(VALID_PLACEMENTS_SET.has('invalid')).toBe(false);
  });

  it('defines focusable DOM selector string', () => {
    expect(FOCUSABLE_ELEMENTS_SELECTOR).toContain('button:not([disabled])');
    expect(FOCUSABLE_ELEMENTS_SELECTOR).toContain('a[href]');
  });
});
