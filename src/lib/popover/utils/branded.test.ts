import { describe, it, expect } from 'vitest';
import {
  toPopoverKey,
  toParentKey,
  toOwnerId,
  toStackGroupId,
  toDurationMs,
  toTimestampMs,
  toZIndexDepth,
  isPopoverKey,
} from './branded';

describe('Nominal Branded Types & Smart Constructors', () => {
  describe('toPopoverKey & isPopoverKey', () => {
    it('creates branded PopoverKey from valid non-empty string', () => {
      const key = toPopoverKey('user-profile');
      expect(key).toBe('user-profile');
      expect(isPopoverKey(key)).toBe(true);
    });

    it('throws TypeError for empty or whitespace-only strings', () => {
      expect(() => toPopoverKey('')).toThrow(TypeError);
      expect(() => toPopoverKey('   ')).toThrow(TypeError);
      // @ts-expect-error - testing invalid runtime inputs
      expect(() => toPopoverKey(null)).toThrow(TypeError);
    });

    it('validates keys with isPopoverKey predicate', () => {
      expect(isPopoverKey('validKey')).toBe(true);
      expect(isPopoverKey('')).toBe(false);
      expect(isPopoverKey(null)).toBe(false);
      expect(isPopoverKey(123)).toBe(false);
    });
  });

  describe('toParentKey, toOwnerId, toStackGroupId', () => {
    it('constructs ParentKey, OwnerId, StackGroupId', () => {
      const parent = toParentKey('parent-1');
      const owner = toOwnerId('btn-trigger-1');
      const group = toStackGroupId('modal-layer');

      expect(parent).toBe('parent-1');
      expect(owner).toBe('btn-trigger-1');
      expect(group).toBe('modal-layer');
    });
  });

  describe('Numeric brands: toDurationMs, toTimestampMs, toZIndexDepth', () => {
    it('validates duration with NaN and negativity safety', () => {
      expect(toDurationMs(300)).toBe(300);
      expect(toDurationMs(-50)).toBe(0);
      expect(toDurationMs(Number.NaN)).toBe(0);
      expect(toDurationMs(Infinity)).toBe(0);
    });

    it('validates timestamps', () => {
      const explicit = toTimestampMs(1700000000);
      expect(explicit).toBe(1700000000);

      const autoNow = toTimestampMs();
      expect(autoNow).toBeGreaterThan(0);

      expect(toTimestampMs(Number.NaN)).toBeGreaterThan(0);
    });

    it('validates z-index depth with integer floor clamping', () => {
      expect(toZIndexDepth(10.8)).toBe(10);
      expect(toZIndexDepth(-5)).toBe(0);
      expect(toZIndexDepth(Number.NaN)).toBe(0);
    });
  });
});
