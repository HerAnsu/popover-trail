import { describe, it, expect } from 'vitest';
import {
  clamp,
  lerp,
  inRange,
  degToRad,
  radToDeg,
  roundTo,
  approxEqual,
  normalizeRatio,
} from './math';

describe('math utilities', () => {
  describe('clamp', () => {
    it('restricts values to [min, max] range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('handles min > max by automatically swapping', () => {
      expect(clamp(5, 10, 0)).toBe(5);
      expect(clamp(-5, 10, 0)).toBe(0);
      expect(clamp(15, 10, 0)).toBe(10);
    });

    it('safely handles non-finite inputs', () => {
      expect(clamp(Number.NaN, 0, 10)).toBe(0);
      expect(clamp(Number.POSITIVE_INFINITY, 0, 10)).toBe(10);
      expect(clamp(Number.NEGATIVE_INFINITY, 0, 10)).toBe(0);
    });

    it('safely handles non-finite bounds', () => {
      expect(clamp(5, Number.NaN, 10)).toBe(5);
      expect(clamp(-5, Number.NaN, 10)).toBe(0);
      expect(clamp(5, 0, Number.NaN)).toBe(0);
    });
  });

  describe('lerp', () => {
    it('interpolates correctly at factors 0, 0.5, and 1', () => {
      expect(lerp(0, 100, 0)).toBe(0);
      expect(lerp(0, 100, 0.5)).toBe(50);
      expect(lerp(0, 100, 1)).toBe(100);
    });

    it('supports extrapolation when factor is outside [0, 1]', () => {
      expect(lerp(0, 10, 2)).toBe(20);
      expect(lerp(0, 10, -1)).toBe(-10);
    });

    it('handles non-finite parameters safely', () => {
      expect(lerp(Number.NaN, 100, 0.5)).toBe(50);
      expect(lerp(0, Number.NaN, 0.5)).toBe(0);
      expect(lerp(0, 100, Number.NaN)).toBe(0);
    });
  });

  describe('inRange', () => {
    it('returns true when value is strictly inside or at bounds', () => {
      expect(inRange(5, 0, 10)).toBe(true);
      expect(inRange(0, 0, 10)).toBe(true);
      expect(inRange(10, 0, 10)).toBe(true);
    });

    it('returns false when value is outside bounds', () => {
      expect(inRange(-1, 0, 10)).toBe(false);
      expect(inRange(11, 0, 10)).toBe(false);
    });

    it('handles inverted bounds', () => {
      expect(inRange(5, 10, 0)).toBe(true);
      expect(inRange(-1, 10, 0)).toBe(false);
    });

    it('returns false for non-finite inputs', () => {
      expect(inRange(Number.NaN, 0, 10)).toBe(false);
      expect(inRange(Number.POSITIVE_INFINITY, 0, 10)).toBe(false);
    });
  });

  describe('degToRad and radToDeg', () => {
    it('converts degrees to radians and back', () => {
      expect(degToRad(180)).toBeCloseTo(Math.PI);
      expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
      expect(degToRad(0)).toBe(0);

      expect(radToDeg(Math.PI)).toBeCloseTo(180);
      expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
      expect(radToDeg(0)).toBe(0);
    });

    it('handles non-finite values safely', () => {
      expect(degToRad(Number.NaN)).toBe(0);
      expect(radToDeg(Number.NaN)).toBe(0);
    });
  });

  describe('roundTo', () => {
    it('rounds numbers to specified decimal places', () => {
      expect(roundTo(1.2345, 2)).toBe(1.23);
      expect(roundTo(1.2355, 2)).toBe(1.24);
      expect(roundTo(1.5, 0)).toBe(2);
      expect(roundTo(100.005, 2)).toBe(100.01);
    });

    it('handles non-finite values safely', () => {
      expect(roundTo(Number.NaN)).toBe(0);
      expect(roundTo(Number.POSITIVE_INFINITY)).toBe(0);
    });
  });

  describe('approxEqual', () => {
    it('evaluates floating-point equality with epsilon threshold', () => {
      expect(approxEqual(0.1 + 0.2, 0.3)).toBe(true);
      expect(approxEqual(10, 10.0000001)).toBe(true);
      expect(approxEqual(10, 10.01)).toBe(false);
      expect(approxEqual(10, 10.01, 0.05)).toBe(true);
    });

    it('returns false for non-finite values', () => {
      expect(approxEqual(Number.NaN, Number.NaN)).toBe(false);
      expect(approxEqual(Number.POSITIVE_INFINITY, 10)).toBe(false);
    });
  });

  describe('normalizeRatio', () => {
    it('normalizes scalar into [0, 1] range', () => {
      expect(normalizeRatio(50, 0, 100)).toBe(0.5);
      expect(normalizeRatio(0, 0, 100)).toBe(0);
      expect(normalizeRatio(100, 0, 100)).toBe(1);
    });

    it('clamps outside values to [0, 1]', () => {
      expect(normalizeRatio(-10, 0, 100)).toBe(0);
      expect(normalizeRatio(150, 0, 100)).toBe(1);
    });

    it('returns 0 if min === max', () => {
      expect(normalizeRatio(5, 5, 5)).toBe(0);
    });
  });
});
