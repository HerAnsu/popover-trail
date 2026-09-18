import { describe, it, expect } from 'vitest';
import { sanitizeBounds, getQuadrantIndex, Quadrant } from './spatialBounds';

describe('spatialBounds', () => {
  describe('sanitizeBounds', () => {
    it('returns zeroes when bounds are undefined', () => {
      const result = sanitizeBounds();
      expect(result).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });

    it('sanitizes NaN and Infinity to zero', () => {
      const result = sanitizeBounds({
        x: Number.NaN,
        y: Number.POSITIVE_INFINITY,
        width: Number.NEGATIVE_INFINITY,
        height: 150,
      });
      expect(result).toEqual({ x: 0, y: 0, width: 0, height: 150 });
    });

    it('clamps negative dimensions to zero', () => {
      const result = sanitizeBounds({
        x: 10,
        y: 20,
        width: -50,
        height: -100,
      });
      expect(result).toEqual({ x: 10, y: 20, width: 0, height: 0 });
    });

    it('preserves valid finite coordinates and dimensions', () => {
      const result = sanitizeBounds({
        x: 15,
        y: 25,
        width: 200,
        height: 300,
      });
      expect(result).toEqual({ x: 15, y: 25, width: 200, height: 300 });
    });
  });

  describe('getQuadrantIndex', () => {
    const parent = { x: 0, y: 0, width: 100, height: 100 };

    it('identifies top-left NW quadrant (1)', () => {
      const target = { x: 5, y: 5, width: 20, height: 20 };
      expect(getQuadrantIndex(target, parent)).toBe(Quadrant.NW);
    });

    it('identifies top-right NE quadrant (0)', () => {
      const target = { x: 60, y: 5, width: 20, height: 20 };
      expect(getQuadrantIndex(target, parent)).toBe(Quadrant.NE);
    });

    it('identifies bottom-left SW quadrant (2)', () => {
      const target = { x: 5, y: 60, width: 20, height: 20 };
      expect(getQuadrantIndex(target, parent)).toBe(Quadrant.SW);
    });

    it('identifies bottom-right SE quadrant (3)', () => {
      const target = { x: 60, y: 60, width: 20, height: 20 };
      expect(getQuadrantIndex(target, parent)).toBe(Quadrant.SE);
    });

    it('returns None (-1) when straddling the vertical dividing line', () => {
      const target = { x: 40, y: 10, width: 20, height: 20 };
      expect(getQuadrantIndex(target, parent)).toBe(Quadrant.None);
    });

    it('returns None (-1) when straddling the horizontal dividing line', () => {
      const target = { x: 10, y: 40, width: 20, height: 20 };
      expect(getQuadrantIndex(target, parent)).toBe(Quadrant.None);
    });

    it('returns None (-1) when straddling both lines in the center', () => {
      const target = { x: 45, y: 45, width: 20, height: 20 };
      expect(getQuadrantIndex(target, parent)).toBe(Quadrant.None);
    });
  });
});
