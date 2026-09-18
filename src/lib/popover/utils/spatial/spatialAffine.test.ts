import { describe, it, expect } from 'vitest';
import {
  identityMatrix,
  multiplyMatrix2D,
  invertMatrix2D,
  transformPoint2D,
  inverseTransformPoint2D,
  transformAABB,
  transformPoint2DInto,
  transformAABBInto,
  type Matrix2D,
} from './spatialAffine';

describe('spatialAffine', () => {
  it('identity matrix preserves points and bounding boxes', () => {
    const id = identityMatrix();
    const p = { x: 50, y: 75 };
    expect(transformPoint2D(p, id)).toEqual({ x: 50, y: 75 });

    const box = { x: 10, y: 20, width: 30, height: 40 };
    expect(transformAABB(box, id)).toEqual(box);
  });

  it('multiplies matrices correctly', () => {
    // scale by 2
    const scale: Matrix2D = [2, 0, 0, 2, 0, 0];
    // translate by (10, 20)
    const translate: Matrix2D = [1, 0, 0, 1, 10, 20];

    const combined = multiplyMatrix2D(translate, scale);
    const p = transformPoint2D({ x: 5, y: 5 }, combined);
    expect(p).toEqual({ x: 20, y: 30 });
  });

  it('inverts non-singular matrices and returns null for singular ones', () => {
    const scaleTranslate: Matrix2D = [2, 0, 0, 2, 10, 20];
    const inv = invertMatrix2D(scaleTranslate);
    expect(inv).not.toBeNull();

    const pLocal = { x: 5, y: 5 };
    const pScreen = transformPoint2D(pLocal, scaleTranslate);
    expect(pScreen).toEqual({ x: 20, y: 30 });

    const restored = inverseTransformPoint2D(pScreen, scaleTranslate);
    expect(restored.x).toBeCloseTo(5);
    expect(restored.y).toBeCloseTo(5);

    // Singular matrix (det = 0)
    const singular: Matrix2D = [0, 0, 0, 0, 10, 20];
    expect(invertMatrix2D(singular)).toBeNull();
  });

  it('transforms AABB bounding box', () => {
    const box = { x: 10, y: 20, width: 30, height: 40 };
    const matrix: Matrix2D = [2, 0, 0, 2, 5, 5];
    const transformed = transformAABB(box, matrix);

    expect(transformed).toEqual({
      x: 25,
      y: 45,
      width: 60,
      height: 80,
    });
  });

  it('transforms in-place with transformPoint2DInto and transformAABBInto', () => {
    const matrix: Matrix2D = [2, 0, 0, 2, 5, 5];
    const pOut = { x: 0, y: 0 };
    transformPoint2DInto({ x: 10, y: 10 }, matrix, pOut);
    expect(pOut).toEqual({ x: 25, y: 25 });

    const bOut = { x: 0, y: 0, width: 0, height: 0 };
    transformAABBInto({ x: 10, y: 20, width: 30, height: 40 }, matrix, bOut);
    expect(bOut).toEqual({ x: 25, y: 45, width: 60, height: 80 });
  });
});
