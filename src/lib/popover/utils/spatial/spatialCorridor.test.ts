import { describe, it, expect } from 'vitest';
import {
  isCursorInSafeCorridor,
  isCursorInSafeTriangle,
  isPointInBox,
  isPointInTriangle,
} from './spatialCorridor';

describe('spatialCorridor', () => {
  it('identifies points within a 2d triangle', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 100, y: 0 };
    const c = { x: 50, y: 100 };

    expect(isPointInTriangle({ x: 50, y: 50 }, a, b, c)).toBe(true);
    expect(isPointInTriangle({ x: 150, y: 50 }, a, b, c)).toBe(false);
  });

  it('identifies points within an AABB box', () => {
    const box = { x: 10, y: 10, width: 50, height: 50 };
    expect(isPointInBox({ x: 30, y: 30 }, box)).toBe(true);
    expect(isPointInBox({ x: 5, y: 30 }, box)).toBe(false);
  });

  it('computes safe triangle when anchor is to the left of target', () => {
    const anchor = { x: 0, y: 50 };
    const target = { x: 100, y: 0, width: 100, height: 100 };

    // Cursor in the diagonal corridor between anchor and target
    expect(isCursorInSafeTriangle({ x: 50, y: 50 }, anchor, target)).toBe(true);
    expect(isCursorInSafeTriangle({ x: 50, y: 150 }, anchor, target)).toBe(false);
  });

  it('allows cursor either inside safe triangle or directly inside target card', () => {
    const anchor = { x: 0, y: 50 };
    const target = { x: 100, y: 0, width: 100, height: 100 };

    expect(isCursorInSafeCorridor({ x: 50, y: 50 }, anchor, target)).toBe(true);
    expect(isCursorInSafeCorridor({ x: 150, y: 50 }, anchor, target)).toBe(true);
    expect(isCursorInSafeCorridor({ x: -10, y: 50 }, anchor, target)).toBe(false);
  });
});
