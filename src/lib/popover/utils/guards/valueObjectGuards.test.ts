import { describe, it, expect } from 'vitest';
import {
  isZIndex,
  isDurationMs,
  isPoint2DInstance,
  isRectBoundsInstance,
} from './valueObjectGuards';
import { ZIndex, DurationMs } from '../domainValues';
import { Point2D } from '../Point2D';
import { RectBounds } from '../RectBounds';

describe('valueObjectGuards', () => {
  it('identifies ZIndex value objects and rejects non-ZIndex', () => {
    const z = ZIndex.of(10);
    expect(isZIndex(z)).toBe(true);
    expect(isZIndex({ value: 10, elevate: () => z })).toBe(true);
    expect(isZIndex(null)).toBe(false);
    expect(isZIndex(10)).toBe(false);
    expect(isZIndex({})).toBe(false);
  });

  it('identifies DurationMs value objects and rejects non-DurationMs', () => {
    const d = DurationMs.of(300);
    expect(isDurationMs(d)).toBe(true);
    expect(isDurationMs(null)).toBe(false);
    expect(isDurationMs(300)).toBe(false);
    expect(isDurationMs({ value: 300 })).toBe(false);
  });

  it('identifies Point2D instances and rejects invalid points', () => {
    const pt = Point2D.of(5, 10);
    expect(isPoint2DInstance(pt)).toBe(true);
    expect(isPoint2DInstance(null)).toBe(false);
    expect(isPoint2DInstance({ x: 5, y: 10 })).toBe(false);
    expect(isPoint2DInstance({ x: 5, y: 10, distanceTo: () => 0 })).toBe(true);
  });

  it('identifies RectBounds instances and rejects invalid rects', () => {
    const r = RectBounds.of(0, 0, 100, 100);
    expect(isRectBoundsInstance(r)).toBe(true);
    expect(isRectBoundsInstance(null)).toBe(false);
    expect(isRectBoundsInstance({ top: 0, left: 0, width: 100, height: 100 })).toBe(false);
  });
});
