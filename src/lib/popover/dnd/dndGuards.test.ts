import { describe, it, expect } from 'vitest';
import { isTransform2D, isNodeRect, isBoundsRect, isPopoverCardFeatures } from './dndGuards';

describe('dndGuards', () => {
  it('validates Transform2D with finite coordinates and scale', () => {
    expect(isTransform2D({ x: 10, y: 20, scaleX: 1, scaleY: 1 })).toBe(true);
    expect(isTransform2D({ x: Number.NaN, y: 20, scaleX: 1, scaleY: 1 })).toBe(false);
    expect(isTransform2D(null)).toBe(false);
  });

  it('validates NodeRect with non-negative dimensions', () => {
    expect(isNodeRect({ left: 0, top: 0, width: 100, height: 50 })).toBe(true);
    expect(isNodeRect({ left: 0, top: 0, width: -10, height: 50 })).toBe(false);
    expect(isNodeRect({ left: 0, top: 0, width: 100, height: -5 })).toBe(false);
    expect(isNodeRect(null)).toBe(false);
  });

  it('validates BoundsRect with valid spatial boundaries', () => {
    expect(isBoundsRect({ left: 10, top: 20, right: 100, bottom: 200 })).toBe(true);
    expect(isBoundsRect({ left: 100, top: 20, right: 50, bottom: 200 })).toBe(false);
    expect(isBoundsRect({ left: 10, top: 200, right: 100, bottom: 50 })).toBe(false);
  });

  it('validates PopoverCardFeatures plain objects', () => {
    expect(isPopoverCardFeatures({ drag: true, tilt: false })).toBe(true);
    expect(isPopoverCardFeatures(null)).toBe(false);
  });
});
