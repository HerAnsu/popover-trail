import { describe, it, expect } from 'vitest';
import {
  normalizeDragDelta,
  normalizeDragDeltaInto,
  computeTiltMatrix,
  computeTiltMatrixInPlace,
  applyDragFriction,
} from './dragPhysics';

describe('dragPhysics', () => {
  describe('normalizeDragDelta and normalizeDragDeltaInto', () => {
    it('normalizes drag offsets according to zoom scale', () => {
      expect(normalizeDragDelta(20, 40, 2)).toEqual({ x: 10, y: 20 });
      expect(normalizeDragDelta(10, -15, 0.5)).toEqual({ x: 20, y: -30 });
    });

    it('falls back to scale 1 when scale is zero, negative, or non-finite', () => {
      expect(normalizeDragDelta(15, 25, 0)).toEqual({ x: 15, y: 25 });
      expect(normalizeDragDelta(15, 25, -2)).toEqual({ x: 15, y: 25 });
      expect(normalizeDragDelta(15, 25, Number.NaN)).toEqual({ x: 15, y: 25 });
      expect(normalizeDragDelta(15, 25, Number.POSITIVE_INFINITY)).toEqual({ x: 15, y: 25 });
    });

    it('handles non-finite delta inputs and mutates in-place destination object', () => {
      const out = { x: 99, y: 99 };
      normalizeDragDeltaInto(Number.NaN, Number.POSITIVE_INFINITY, 2, out);
      expect(out).toEqual({ x: 0, y: 0 });

      normalizeDragDeltaInto(30, 60, 3, out);
      expect(out).toEqual({ x: 10, y: 20 });
    });
  });

  describe('computeTiltMatrix and computeTiltMatrixInPlace', () => {
    it('returns zero rotation angles when velocity is zero', () => {
      const result = computeTiltMatrix(0, 0);
      expect(Math.abs(result.rotationX)).toBe(0);
      expect(Math.abs(result.rotationY)).toBe(0);
    });

    it('computes 3D pitch and roll tilt angles proportional to delta and sensitivity', () => {
      // deltaY = 10 -> rotationX = -10 * 0.1 = -1
      // deltaX = 20 -> rotationY = 20 * 0.1 = 2
      const res = computeTiltMatrix(20, 10, 15, 0.1);
      expect(res.rotationX).toBe(-1);
      expect(res.rotationY).toBe(2);

      const raw = computeTiltMatrix(-10, -30, 20, 0.2);
      expect(raw.rotationX).toBe(6);
      expect(raw.rotationY).toBe(-2);
    });

    it('clamps tilt angles within specified maxAngle threshold', () => {
      const maxAngle = 8;
      const extreme = computeTiltMatrix(500, -500, maxAngle, 0.2);
      expect(extreme.rotationX).toBe(maxAngle);
      expect(extreme.rotationY).toBe(maxAngle);

      const out = { rotationX: 0, rotationY: 0 };
      computeTiltMatrixInPlace(-1000, 1000, maxAngle, 0.5, out);
      expect(out.rotationX).toBe(-maxAngle);
      expect(out.rotationY).toBe(-maxAngle);
    });

    it('falls back safely on non-finite or negative maxAngle inputs', () => {
      const fallback = computeTiltMatrix(100, 100, -5, 0.1);
      // maxAngle falls back to default 15
      expect(Math.abs(fallback.rotationX)).toBeLessThanOrEqual(15);
      expect(Math.abs(fallback.rotationY)).toBeLessThanOrEqual(15);
    });
  });

  describe('applyDragFriction', () => {
    it('preserves full delta when friction is zero', () => {
      expect(applyDragFriction(50, 0)).toBe(50);
      expect(applyDragFriction(-30, 0)).toBe(-30);
    });

    it('damps delta proportionally with fractional friction factor', () => {
      // delta * (1 - 0.2) = 80
      expect(applyDragFriction(100, 0.2)).toBeCloseTo(80);
      // delta * (1 - 0.5) = 25
      expect(applyDragFriction(50, 0.5)).toBeCloseTo(25);
    });

    it('completely halts movement when friction is 1', () => {
      expect(applyDragFriction(100, 1)).toBe(0);
    });

    it('clamps friction outside [0, 1] range', () => {
      expect(applyDragFriction(100, 2.5)).toBe(0); // friction > 1 clamped to 1
      expect(applyDragFriction(100, -0.5)).toBe(100); // friction < 0 clamped to 0
    });
  });
});
