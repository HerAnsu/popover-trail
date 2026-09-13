import { describe, it, expect } from 'vitest';
import {
  createPoint2D,
  distanceSquared2D,
  distance2D,
  manhattanDistance2D,
  vectorLength2D,
  dotProduct2D,
  addPoints2D,
  addPoints2DInto,
  subtractPoints2D,
  subtractPoints2DInto,
  scalePoint2D,
  scalePoint2DInto,
  lerpPoint2D,
  lerpPoint2DInto,
} from './spatialVector';

describe('spatialVector', () => {
  it('creates 2D points with finite float guarantee', () => {
    expect(createPoint2D(10, 20)).toEqual({ x: 10, y: 20 });
    expect(createPoint2D(Number.NaN, Number.POSITIVE_INFINITY)).toEqual({ x: 0, y: 0 });
    expect(createPoint2D()).toEqual({ x: 0, y: 0 });
  });

  it('computes euclidean and squared distances accurately', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 3, y: 4 };
    expect(distanceSquared2D(a, b)).toBe(25);
    expect(distance2D(a, b)).toBe(5);
  });

  it('computes manhattan distance accurately', () => {
    const a = { x: 1, y: 2 };
    const b = { x: 4, y: 6 };
    expect(manhattanDistance2D(a, b)).toBe(7);
  });

  it('computes vector length and dot product', () => {
    expect(vectorLength2D({ x: 3, y: 4 })).toBe(5);
    expect(dotProduct2D({ x: 1, y: 2 }, { x: 3, y: 4 })).toBe(11);
    expect(dotProduct2D({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(0);
  });

  it('adds points with both pure and Zero-GC into variants', () => {
    const a = { x: 10, y: 20 };
    const b = { x: 5, y: -5 };
    expect(addPoints2D(a, b)).toEqual({ x: 15, y: 15 });

    const scratch = { x: 0, y: 0 };
    addPoints2DInto(a, b, scratch);
    expect(scratch).toEqual({ x: 15, y: 15 });
  });

  it('subtracts points with both pure and Zero-GC into variants', () => {
    const a = { x: 10, y: 20 };
    const b = { x: 4, y: 5 };
    expect(subtractPoints2D(a, b)).toEqual({ x: 6, y: 15 });

    const scratch = { x: 0, y: 0 };
    subtractPoints2DInto(a, b, scratch);
    expect(scratch).toEqual({ x: 6, y: 15 });
  });

  it('scales points with both pure and Zero-GC into variants', () => {
    const p = { x: 4, y: 6 };
    expect(scalePoint2D(p, 2.5)).toEqual({ x: 10, y: 15 });

    const scratch = { x: 0, y: 0 };
    scalePoint2DInto(p, 0.5, scratch);
    expect(scratch).toEqual({ x: 2, y: 3 });
  });

  it('interpolates points linearly with clamped t parameter', () => {
    const start = { x: 0, y: 10 };
    const end = { x: 10, y: 20 };
    expect(lerpPoint2D(start, end, 0.5)).toEqual({ x: 5, y: 15 });
    expect(lerpPoint2D(start, end, -1)).toEqual({ x: 0, y: 10 });
    expect(lerpPoint2D(start, end, 2)).toEqual({ x: 10, y: 20 });

    const scratch = { x: 0, y: 0 };
    lerpPoint2DInto(start, end, 0.25, scratch);
    expect(scratch).toEqual({ x: 2.5, y: 12.5 });
  });
});
