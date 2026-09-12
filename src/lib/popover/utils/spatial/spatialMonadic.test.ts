import { describe, it, expect } from 'vitest';
import { invertMatrix2DResult, type Matrix2D } from './spatialAffine';
import { QuadTree } from './quadTreeCore';
import { isOk, isErr } from '../result';

describe('Spatial Monadic Results', () => {
  it('inverts non-singular affine matrix successfully', () => {
    // Identity matrix
    const identity: Matrix2D = [1, 0, 0, 1, 0, 0];
    const res = invertMatrix2DResult(identity);
    expect(isOk(res)).toBe(true);
    if (isOk(res)) {
      expect(res.data[0]).toBe(1);
      expect(res.data[1]).toBeCloseTo(0);
      expect(res.data[2]).toBeCloseTo(0);
      expect(res.data[3]).toBe(1);
      expect(res.data[4]).toBeCloseTo(0);
      expect(res.data[5]).toBeCloseTo(0);
    }

    // Scale and translate matrix
    const scaleTranslate: Matrix2D = [2, 0, 0, 2, 10, 20];
    const res2 = invertMatrix2DResult(scaleTranslate);
    expect(isOk(res2)).toBe(true);
    if (isOk(res2)) {
      expect(res2.data[0]).toBe(0.5);
      expect(res2.data[3]).toBe(0.5);
    }
  });

  it('returns singular_matrix error for degenerate matrix', () => {
    // Zero matrix (det = 0)
    const singular: Matrix2D = [0, 0, 0, 0, 5, 5];
    const res = invertMatrix2DResult(singular);
    expect(isErr(res)).toBe(true);
    if (isErr(res)) {
      expect(res.error.type).toBe('singular_matrix');
      expect(res.error.determinant).toBe(0);
      expect(res.error.message).toContain('Cannot invert singular 2D affine matrix');
    }
  });

  it('QuadTree returns findFirstResult and nearestResult with typed errors', () => {
    const tree = new QuadTree<string>({ x: 0, y: 0, width: 1000, height: 1000 });

    // Empty tree searches
    const emptyFind = tree.findFirstResult({ x: 10, y: 10, width: 50, height: 50 });
    expect(isErr(emptyFind)).toBe(true);
    if (isErr(emptyFind)) {
      expect(emptyFind.error.type).toBe('spatial_not_found');
    }

    const emptyNear = tree.nearestResult({ x: 50, y: 50 }, 100);
    expect(isErr(emptyNear)).toBe(true);
    if (isErr(emptyNear)) {
      expect(emptyNear.error.type).toBe('spatial_not_found');
    }

    // Insert item and search again
    tree.insert({ id: 'item-1', bounds: { x: 20, y: 20, width: 60, height: 60 } });

    const found = tree.findFirstResult({ x: 10, y: 10, width: 50, height: 50 });
    expect(isOk(found)).toBe(true);
    if (isOk(found)) {
      expect(found.data.id).toBe('item-1');
    }

    const nearest = tree.nearestResult({ x: 25, y: 25 });
    expect(isOk(nearest)).toBe(true);
    if (isOk(nearest)) {
      expect(nearest.data.id).toBe('item-1');
    }
  });
});
