import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getViewportBounds,
  resolveMiddlewareExtraProps,
  calculateAutoPlacement,
  calculateResponsivePosition,
} from './viewportGeometry';

describe('viewportGeometry', () => {
  const origWin = globalThis.window;

  beforeEach(() => {
    globalThis.window = origWin;
  });

  afterEach(() => {
    globalThis.window = origWin;
  });

  describe('getViewportBounds', () => {
    it('measures viewport dimensions from window in browser environment', () => {
      globalThis.window = {
        innerWidth: 1440,
        innerHeight: 900,
      } as unknown as Window & typeof globalThis;

      expect(getViewportBounds()).toEqual({ width: 1440, height: 900 });
    });

    it('returns SSR fallback defaults when window is undefined', () => {
      // @ts-expect-error - simulating SSR environment
      delete globalThis.window;

      expect(getViewportBounds()).toEqual({ width: 1024, height: 768 });
    });
  });

  describe('resolveMiddlewareExtraProps', () => {
    it('extracts shallow copy of record options', () => {
      const options = { padding: 8, crossAxis: 12 };
      const resolved = resolveMiddlewareExtraProps(options);
      expect(resolved).toEqual(options);
      expect(resolved).not.toBe(options);
    });

    it('returns empty object for primitives, arrays, null, or undefined', () => {
      expect(resolveMiddlewareExtraProps(null)).toEqual({});
      expect(resolveMiddlewareExtraProps(undefined)).toEqual({});
      expect(resolveMiddlewareExtraProps('string')).toEqual({});
      expect(resolveMiddlewareExtraProps(42)).toEqual({});
    });
  });

  describe('calculateAutoPlacement', () => {
    it('preserves non-auto placement unmodified', () => {
      expect(calculateAutoPlacement('top-start', null)).toBe('top-start');
      expect(calculateAutoPlacement('bottom', undefined)).toBe('bottom');
    });

    it('falls back to "right" when anchorRect is null or undefined', () => {
      expect(calculateAutoPlacement('auto', null)).toBe('right');
      expect(calculateAutoPlacement('auto', undefined)).toBe('right');
    });

    it('resolves auto placement to left or right based on viewport center', () => {
      globalThis.window = {
        innerWidth: 1000,
      } as unknown as Window & typeof globalThis;

      // Anchor on right half: center at 750 > 500 -> left
      const rightAnchor = { left: 700, width: 100, top: 0, height: 50, bottom: 50, right: 800 };
      expect(calculateAutoPlacement('auto', rightAnchor)).toBe('left');

      // Anchor on left half: center at 250 <= 500 -> right
      const leftAnchor = { left: 200, width: 100, top: 0, height: 50, bottom: 50, right: 300 };
      expect(calculateAutoPlacement('auto', leftAnchor)).toBe('right');
    });
  });

  describe('calculateResponsivePosition', () => {
    it('calculates bottom-sheet coordinates on mobile viewport', () => {
      const pos = calculateResponsivePosition('bottom-sheet', true, undefined, 500, 800);
      expect(pos).toEqual({ top: 480, left: 50 });
    });

    it('calculates centered modal coordinates', () => {
      const pos = calculateResponsivePosition('modal', false, undefined, 1000, 750);
      expect(pos).toEqual({ top: 200, left: 300 });
    });

    it('calculates docked-top coordinates', () => {
      const pos = calculateResponsivePosition(undefined, false, 'docked-top', 1000, 700);
      expect(pos).toEqual({ top: 10, left: 300 });
    });

    it('returns null for default non-responsive standard layout', () => {
      const pos = calculateResponsivePosition(undefined, false, undefined, 1000, 800);
      expect(pos).toBeNull();
    });
  });
});
