import { describe, it, expect } from 'vitest';
import {
  boundingUnion,
  distanceToBox,
  intersectionArea,
  intersectionBox,
  overlapRatio,
} from './spatialAABB';

describe('spatialAABB', () => {
  it('computes intersection box and area correctly', () => {
    const a = { x: 0, y: 0, width: 100, height: 100 };
    const b = { x: 50, y: 50, width: 100, height: 100 };

    const inter = intersectionBox(a, b);
    expect(inter).toEqual({ x: 50, y: 50, width: 50, height: 50 });
    expect(intersectionArea(a, b)).toBe(2500);
  });

  it('returns null and 0 area for non-intersecting boxes', () => {
    const a = { x: 0, y: 0, width: 50, height: 50 };
    const b = { x: 100, y: 100, width: 50, height: 50 };

    expect(intersectionBox(a, b)).toBeNull();
    expect(intersectionArea(a, b)).toBe(0);
  });

  it('computes bounding union correctly', () => {
    const a = { x: 10, y: 20, width: 30, height: 40 };
    const b = { x: 50, y: 60, width: 20, height: 10 };

    const union = boundingUnion(a, b);
    expect(union).toEqual({ x: 10, y: 20, width: 60, height: 50 });
  });

  it('computes overlap ratio (IoU)', () => {
    const a = { x: 0, y: 0, width: 100, height: 100 }; // 10000
    const b = { x: 0, y: 0, width: 100, height: 100 };
    expect(overlapRatio(a, b)).toBe(1);

    const c = { x: 50, y: 0, width: 100, height: 100 };
    expect(overlapRatio(a, c)).toBeCloseTo(1 / 3, 4);
  });

  it('computes euclidean distance from point to box', () => {
    const box = { x: 100, y: 100, width: 50, height: 50 };

    // Inside box
    expect(distanceToBox({ x: 110, y: 110 }, box)).toBe(0);

    // Off to the left
    expect(distanceToBox({ x: 80, y: 110 }, box)).toBe(20);

    // Diagonal at (x: 70, y: 60) => dx=30, dy=40 => dist=50
    expect(distanceToBox({ x: 70, y: 60 }, box)).toBe(50);
  });
});
