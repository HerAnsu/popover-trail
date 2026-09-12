import { describe, it, expect } from 'vitest';
import {
  isPopoverRect,
  isDOMRect,
  isDOMRectOrPopoverRect,
  isPoint2D,
  isDragOffset,
} from './geometryGuards';

describe('geometryGuards', () => {
  it('validates PopoverRect correctly and rejects non-finite or negative values', () => {
    expect(isPopoverRect({ top: 10, left: 20, width: 100, height: 200 })).toBe(true);
    expect(isPopoverRect({ top: 0, left: 0, width: 0, height: 0 })).toBe(true);

    // Rejects NaN, Infinity, negative dimensions, null/primitives
    expect(isPopoverRect({ top: Number.NaN, left: 20, width: 100, height: 200 })).toBe(false);
    expect(isPopoverRect({ top: 10, left: Infinity, width: 100, height: 200 })).toBe(false);
    expect(isPopoverRect({ top: 10, left: 20, width: -1, height: 200 })).toBe(false);
    expect(isPopoverRect({ top: 10, left: 20, width: 100, height: -5 })).toBe(false);
    expect(isPopoverRect(null)).toBe(false);
    expect(isPopoverRect(undefined)).toBe(false);
    expect(isPopoverRect('rect')).toBe(false);
  });

  it('validates DOMRect duck-type correctly', () => {
    const validDom = {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      top: 0,
      bottom: 100,
      left: 0,
      right: 100,
    };
    expect(isDOMRect(validDom)).toBe(true);
    expect(isDOMRect({ ...validDom, width: Number.NaN })).toBe(false);
    expect(isDOMRect(null)).toBe(false);
  });

  it('validates Point2D and DragOffset', () => {
    expect(isPoint2D({ x: 50, y: 100 })).toBe(true);
    expect(isPoint2D({ x: Number.NaN, y: 100 })).toBe(false);
    expect(isPoint2D(null)).toBe(false);

    expect(isDragOffset({ x: 10, y: -20 })).toBe(true);
    expect(isDragOffset({ x: 99999, y: 0 })).toBe(false);
    expect(isDragOffset(null)).toBe(false);

    expect(isDOMRectOrPopoverRect({ top: 0, left: 0, width: 10, height: 10 })).toBe(true);
    expect(isDOMRectOrPopoverRect('bad')).toBe(false);
  });
});
