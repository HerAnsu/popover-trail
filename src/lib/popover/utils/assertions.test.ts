import { describe, it, expect } from 'vitest';
import {
  assertNonNullable,
  assertValidPopoverKey,
  assertValidOwnerId,
  assertValidRect,
} from './assertions';
import { PopoverError } from './errors';

describe('assertions utility', () => {
  describe('assertNonNullable', () => {
    it('passes for non-null and non-undefined values', () => {
      expect(() => assertNonNullable('hello')).not.toThrow();
      expect(() => assertNonNullable(0)).not.toThrow();
      expect(() => assertNonNullable(false)).not.toThrow();
      expect(() => assertNonNullable({})).not.toThrow();
    });

    it('throws PopoverError for null and undefined', () => {
      expect(() => assertNonNullable(null, 'testProp')).toThrow(PopoverError);
      expect(() => assertNonNullable(undefined, 'testProp')).toThrow(
        'Precondition assertion failed: testProp cannot be null or undefined.',
      );
    });
  });

  describe('assertValidPopoverKey', () => {
    it('passes for valid non-empty strings', () => {
      expect(() => assertValidPopoverKey('card-1')).not.toThrow();
      expect(() => assertValidPopoverKey('user:profile')).not.toThrow();
    });

    it('throws for empty string, whitespace, or non-string values', () => {
      expect(() => assertValidPopoverKey('')).toThrow(PopoverError);
      expect(() => assertValidPopoverKey('   ')).toThrow(PopoverError);
      expect(() => assertValidPopoverKey(123)).toThrow(PopoverError);
      expect(() => assertValidPopoverKey(null)).toThrow(PopoverError);
    });
  });

  describe('assertValidOwnerId', () => {
    it('passes for valid non-empty string owner IDs', () => {
      expect(() => assertValidOwnerId('owner-1')).not.toThrow();
    });

    it('throws for invalid owner IDs', () => {
      expect(() => assertValidOwnerId('')).toThrow(PopoverError);
      expect(() => assertValidOwnerId('  ')).toThrow(PopoverError);
      expect(() => assertValidOwnerId(undefined)).toThrow(PopoverError);
    });
  });

  describe('assertValidRect', () => {
    it('passes for valid DOMRect objects with finite numbers', () => {
      const rect = { top: 0, left: 10, width: 100, height: 50 };
      expect(() => assertValidRect(rect)).not.toThrow();
    });

    it('throws for null or non-object rects', () => {
      expect(() => assertValidRect(null)).toThrow(PopoverError);
      expect(() => assertValidRect('rect')).toThrow(PopoverError);
    });

    it('throws for rects with NaN or Infinity coordinates', () => {
      expect(() => assertValidRect({ top: Number.NaN, left: 0, width: 10, height: 10 })).toThrow(
        PopoverError,
      );
      expect(() => assertValidRect({ top: 0, left: Infinity, width: 10, height: 10 })).toThrow(
        PopoverError,
      );
    });
  });
});
