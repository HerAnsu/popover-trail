import { describe, it, expect } from 'vitest';
import { isPositionCoordinates, isPositionComputeOptions } from './positioningGuards';

describe('positioningGuards', () => {
  describe('isPositionCoordinates', () => {
    it('accepts valid coordinates with finite numbers and valid placement', () => {
      expect(isPositionCoordinates({ x: 100, y: 200, placement: 'top-start' })).toBe(true);
      expect(isPositionCoordinates({ x: 0, y: 0, placement: 'bottom' })).toBe(true);
    });

    it('rejects non-finite coordinates or invalid placement', () => {
      expect(isPositionCoordinates({ x: Number.NaN, y: 200, placement: 'top' })).toBe(false);
      expect(isPositionCoordinates({ x: 100, y: Infinity, placement: 'top' })).toBe(false);
      expect(isPositionCoordinates({ x: 100, y: 200, placement: 'invalid-side' })).toBe(false);
      expect(isPositionCoordinates(null)).toBe(false);
      expect(isPositionCoordinates(42)).toBe(false);
    });
  });

  describe('isPositionComputeOptions', () => {
    it('accepts valid compute options', () => {
      expect(isPositionComputeOptions({})).toBe(true);
      expect(
        isPositionComputeOptions({
          placement: 'bottom-end',
          offset: 8,
          flip: true,
          shift: false,
          autoPlacement: true,
        }),
      ).toBe(true);
    });

    it('rejects invalid option property types', () => {
      expect(isPositionComputeOptions({ placement: 'bad' })).toBe(false);
      expect(isPositionComputeOptions({ offset: '8' })).toBe(false);
      expect(isPositionComputeOptions({ offset: Number.NaN })).toBe(false);
      expect(isPositionComputeOptions({ flip: 'true' })).toBe(false);
      expect(isPositionComputeOptions(null)).toBe(false);
    });
  });
});
