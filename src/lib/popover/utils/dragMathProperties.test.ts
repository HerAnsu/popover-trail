import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  clampDragCoordinates,
  clampDragCoordinatesInPlace,
  normalizeDragDelta,
  normalizeDragDeltaInto,
  computeTiltMatrix,
  computeTiltMatrixInPlace,
  computeRawTiltAngles,
  type ClampBounds,
} from './dragMath';

describe('I_FiniteFloat: Finite Float Guarantee Property Tests', () => {
  const float64Arb = fc.oneof(
    fc.double(),
    fc.constantFrom(
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.MIN_VALUE,
      -Number.MIN_VALUE,
      Number.MAX_VALUE,
      -Number.MAX_VALUE,
      Number.EPSILON,
      0,
      -0,
      1e-308,
      -1e-308,
      5e-324, // subnormal
      -5e-324, // negative subnormal
    ),
  );

  const boundsArb: fc.Arbitrary<ClampBounds | undefined> = fc.option(
    fc.record(
      {
        minX: float64Arb,
        maxX: float64Arb,
        minY: float64Arb,
        maxY: float64Arb,
      },
      { requiredKeys: [] },
    ),
    { nil: undefined },
  );

  it('proves clampDragCoordinates outputs satisfy isFinite(x) && isFinite(y) for all float64 inputs', () => {
    fc.assert(
      fc.property(float64Arb, float64Arb, boundsArb, (x, y, bounds) => {
        const result = clampDragCoordinates(x, y, bounds);

        expect(Number.isFinite(result.x)).toBe(true);
        expect(Number.isFinite(result.y)).toBe(true);

        const outTarget = { x: 0, y: 0 };
        clampDragCoordinatesInPlace(x, y, bounds, outTarget);

        expect(Number.isFinite(outTarget.x)).toBe(true);
        expect(Number.isFinite(outTarget.y)).toBe(true);
        expect(outTarget.x).toBe(result.x);
        expect(outTarget.y).toBe(result.y);
      }),
      { numRuns: 200 },
    );
  });

  it('proves normalizeDragDelta outputs satisfy isFinite(x) && isFinite(y) for all float64 inputs', () => {
    fc.assert(
      fc.property(float64Arb, float64Arb, float64Arb, (deltaX, deltaY, scale) => {
        const result = normalizeDragDelta(deltaX, deltaY, scale);

        expect(Number.isFinite(result.x)).toBe(true);
        expect(Number.isFinite(result.y)).toBe(true);

        const outDelta = { x: 0, y: 0 };
        normalizeDragDeltaInto(deltaX, deltaY, scale, outDelta);

        expect(Number.isFinite(outDelta.x)).toBe(true);
        expect(Number.isFinite(outDelta.y)).toBe(true);
        expect(outDelta.x).toBe(result.x);
        expect(outDelta.y).toBe(result.y);
      }),
      { numRuns: 200 },
    );
  });

  it('proves computeTiltMatrix outputs satisfy isFinite(rotationX) && isFinite(rotationY)', () => {
    fc.assert(
      fc.property(
        float64Arb,
        float64Arb,
        float64Arb,
        float64Arb,
        (deltaX, deltaY, maxAngle, sensitivity) => {
          const tilt = computeTiltMatrix(deltaX, deltaY, maxAngle, sensitivity);
          const rawTilt = computeRawTiltAngles(deltaX, deltaY, maxAngle, sensitivity);

          expect(Number.isFinite(tilt.rotationX)).toBe(true);
          expect(Number.isFinite(tilt.rotationY)).toBe(true);
          expect(Number.isFinite(rawTilt.rotationX)).toBe(true);
          expect(Number.isFinite(rawTilt.rotationY)).toBe(true);

          const outTilt = { rotationX: 0, rotationY: 0 };
          computeTiltMatrixInPlace(deltaX, deltaY, maxAngle, sensitivity, outTilt);

          expect(Number.isFinite(outTilt.rotationX)).toBe(true);
          expect(Number.isFinite(outTilt.rotationY)).toBe(true);
          expect(outTilt.rotationX).toBe(tilt.rotationX);
          expect(outTilt.rotationY).toBe(tilt.rotationY);

          if (Number.isFinite(maxAngle) && maxAngle >= 0) {
            expect(Math.abs(tilt.rotationX)).toBeLessThanOrEqual(maxAngle);
            expect(Math.abs(tilt.rotationY)).toBeLessThanOrEqual(maxAngle);
          }
        },
      ),
      { numRuns: 200 },
    );
  });
});
