import { describe, it, expect } from 'vitest';
import {
  toPopoverKey,
  toParentKey,
  toOwnerId,
  toStackGroupId,
  toDurationMs,
  toTimestampMs,
  toZIndexDepth,
  toViewportX,
  toViewportY,
  isPopoverKey,
  isParentKey,
  isOwnerId,
  isStackGroupId,
  toTriggerId,
  toScopeId,
  toSubscriptionId,
  isTriggerId,
  isScopeId,
  isSubscriptionId,
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

  describe('toParentKey, toOwnerId, toStackGroupId and guards', () => {
    it('constructs and validates ParentKey, OwnerId, StackGroupId', () => {
      const parent = toParentKey('parent-1');
      const owner = toOwnerId('btn-trigger-1');
      const group = toStackGroupId('modal-layer');

      expect(parent).toBe('parent-1');
      expect(owner).toBe('btn-trigger-1');
      expect(group).toBe('modal-layer');

      expect(isParentKey(parent)).toBe(true);
      expect(isParentKey('')).toBe(false);
      expect(isParentKey(null)).toBe(false);

      expect(isOwnerId(owner)).toBe(true);
      expect(isOwnerId('')).toBe(false);
      expect(isOwnerId(undefined)).toBe(false);

      expect(isStackGroupId(group)).toBe(true);
      expect(isStackGroupId('')).toBe(false);
      expect(isStackGroupId(123)).toBe(false);
    });

    it('throws TypeError for empty or invalid strings', () => {
      expect(() => toParentKey('')).toThrow(TypeError);
      expect(() => toOwnerId('')).toThrow(TypeError);
      expect(() => toStackGroupId('')).toThrow(TypeError);
    });
  });

  describe('toTriggerId, toScopeId, toSubscriptionId and guards', () => {
    it('constructs and validates TriggerId, ScopeId, SubscriptionId', () => {
      const trigger = toTriggerId('trigger-nav');
      const scope = toScopeId('scope-card-1');
      const sub = toSubscriptionId('sub-token-abc');

      expect(trigger).toBe('trigger-nav');
      expect(scope).toBe('scope-card-1');
      expect(sub).toBe('sub-token-abc');

      expect(isTriggerId(trigger)).toBe(true);
      expect(isTriggerId('')).toBe(false);
      expect(isTriggerId(null)).toBe(false);

      expect(isScopeId(scope)).toBe(true);
      expect(isScopeId('')).toBe(false);
      expect(isScopeId(undefined)).toBe(false);

      expect(isSubscriptionId(sub)).toBe(true);
      expect(isSubscriptionId('')).toBe(false);
      expect(isSubscriptionId(42)).toBe(false);
    });

    it('throws TypeError for empty or invalid strings', () => {
      expect(() => toTriggerId('')).toThrow(TypeError);
      expect(() => toScopeId('')).toThrow(TypeError);
      expect(() => toSubscriptionId('')).toThrow(TypeError);
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

    it('validates viewport coordinates with NaN and non-finite safety', () => {
      expect(toViewportX(150)).toBe(150);
      expect(toViewportX(Number.NaN)).toBe(0);
      expect(toViewportX(Infinity)).toBe(0);
      expect(toViewportX(-Infinity)).toBe(0);

      expect(toViewportY(300)).toBe(300);
      expect(toViewportY(Number.NaN)).toBe(0);
      expect(toViewportY(Infinity)).toBe(0);
      expect(toViewportY(-Infinity)).toBe(0);
    });
  });
});
