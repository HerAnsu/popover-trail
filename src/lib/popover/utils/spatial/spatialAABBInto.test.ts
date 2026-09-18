import { describe, it, expect } from 'vitest';
import {
  copyBoundingBoxInto,
  intersectionBoxInto,
  boundingUnionInto,
  distanceToBoxSquared,
  type MutableBoundingBox,
} from './spatialAABBInto';

describe('spatialAABBInto', () => {
  it('copies bounding box in-place', () => {
    const src = { x: 10, y: 20, width: 30, height: 40 };
    const out: MutableBoundingBox = { x: 0, y: 0, width: 0, height: 0 };

    copyBoundingBoxInto(src, out);
    expect(out).toEqual(src);
  });

  it('computes intersection in-place and reports boolean overlap', () => {
    const a = { x: 0, y: 0, width: 100, height: 100 };
    const b = { x: 50, y: 50, width: 100, height: 100 };
    const out: MutableBoundingBox = { x: 0, y: 0, width: 0, height: 0 };

    const hit = intersectionBoxInto(a, b, out);
    expect(hit).toBe(true);
    expect(out).toEqual({ x: 50, y: 50, width: 50, height: 50 });

    const disjoint = { x: 300, y: 300, width: 50, height: 50 };
    const hitDisjoint = intersectionBoxInto(a, disjoint, out);
    expect(hitDisjoint).toBe(false);
  });

  it('computes bounding union in-place', () => {
    const a = { x: 10, y: 20, width: 30, height: 40 };
    const b = { x: 50, y: 60, width: 20, height: 10 };
    const out: MutableBoundingBox = { x: 0, y: 0, width: 0, height: 0 };

    boundingUnionInto(a, b, out);
    expect(out).toEqual({ x: 10, y: 20, width: 60, height: 50 });
  });

  it('computes squared distance without sqrt/hypot overhead', () => {
    const box = { x: 100, y: 100, width: 50, height: 50 };
    expect(distanceToBoxSquared({ x: 110, y: 110 }, box)).toBe(0);
    expect(distanceToBoxSquared({ x: 80, y: 100 }, box)).toBe(400); // dx=20, dy=0 => 400
  });
});
