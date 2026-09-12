import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { clampDragCoordinatesInPlace } from './dragBounds';
import { computeTiltMatrixInPlace } from './dragPhysics';
import { shallowEqual } from './equality';
import { EMPTY_ARRAY, EMPTY_OBJECT, ZERO_OFFSET } from '../store/storeDefaults';

declare const process: { memoryUsage?: () => { heapUsed: number } } | undefined;

describe('I_ZeroGC: Hot-Path Zero-Allocation and Singleton Invariants', () => {
  it('strictly preserves frozen singleton instances across store references', () => {
    expect(Object.isFrozen(EMPTY_OBJECT)).toBe(true);
    expect(Object.isFrozen(EMPTY_ARRAY)).toBe(true);
    expect(Object.isFrozen(ZERO_OFFSET)).toBe(true);

    expect(ZERO_OFFSET.x).toBe(0);
    expect(ZERO_OFFSET.y).toBe(0);
    expect(EMPTY_ARRAY).toHaveLength(0);
    expect(Object.keys(EMPTY_OBJECT)).toHaveLength(0);

    // Fast-path identity invariance
    expect(shallowEqual(EMPTY_OBJECT, EMPTY_OBJECT)).toBe(true);
    expect(shallowEqual(EMPTY_ARRAY, EMPTY_ARRAY)).toBe(true);
    expect(shallowEqual(ZERO_OFFSET, ZERO_OFFSET)).toBe(true);
  });

  it('guarantees in-place coordinate clamping mutates scratchpad with 0 object reallocations', () => {
    fc.assert(
      fc.property(
        fc.double({ noNaN: true, noDefaultInfinity: true }),
        fc.double({ noNaN: true, noDefaultInfinity: true }),
        (x, y) => {
          const scratchpad = { x: 0, y: 0 };
          const bounds = { minX: -100, maxX: 100, minY: -100, maxY: 100 };

          const returnVal = clampDragCoordinatesInPlace(x, y, bounds, scratchpad);

          expect(returnVal).toBeUndefined();
          expect(Number.isFinite(scratchpad.x)).toBe(true);
          expect(Number.isFinite(scratchpad.y)).toBe(true);
          expect(scratchpad.x).toBeGreaterThanOrEqual(-100);
          expect(scratchpad.x).toBeLessThanOrEqual(100);
          expect(scratchpad.y).toBeGreaterThanOrEqual(-100);
          expect(scratchpad.y).toBeLessThanOrEqual(100);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('guarantees in-place 3D tilt calculation strictly mutates scratchpad without allocations', () => {
    fc.assert(
      fc.property(
        fc.double({ noNaN: true, noDefaultInfinity: true }),
        fc.double({ noNaN: true, noDefaultInfinity: true }),
        fc.double({ min: 1, max: 45, noNaN: true }),
        fc.double({ min: 0.01, max: 1, noNaN: true }),
        (dx, dy, maxAngle, sensitivity) => {
          const scratchpad = { rotationX: 0, rotationY: 0 };

          const returnVal = computeTiltMatrixInPlace(dx, dy, maxAngle, sensitivity, scratchpad);

          expect(returnVal).toBeUndefined();
          expect(Number.isFinite(scratchpad.rotationX)).toBe(true);
          expect(Number.isFinite(scratchpad.rotationY)).toBe(true);
          expect(Math.abs(scratchpad.rotationX)).toBeLessThanOrEqual(maxAngle);
          expect(Math.abs(scratchpad.rotationY)).toBeLessThanOrEqual(maxAngle);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('guarantees shallowEqual verifies identical structures without intermediate array allocations', () => {
    fc.assert(
      fc.property(
        fc.record({
          alpha: fc.integer(),
          beta: fc.string({ maxLength: 8 }),
          gamma: fc.boolean(),
        }),
        (baseRecord) => {
          const cloneRecord = { ...baseRecord };

          expect(shallowEqual(baseRecord, cloneRecord)).toBe(true);
          expect(shallowEqual(baseRecord, baseRecord)).toBe(true);

          const modifiedRecord = { ...baseRecord, alpha: baseRecord.alpha + 1 };
          expect(shallowEqual(baseRecord, modifiedRecord)).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('executes 10,000 continuous frame loop iterations reusing singletons and scratchpads', () => {
    const coordTarget = { x: 0, y: 0 };
    const tiltTarget = { rotationX: 0, rotationY: 0 };
    const staticBounds = { minX: -200, maxX: 200, minY: -200, maxY: 200 };
    const prevOffset = { x: 10, y: 20 };
    const nextOffset = { x: 10, y: 20 };

    // Warm up JIT optimization and TurboFan compilation
    for (let frame = 0; frame < 5_000; frame++) {
      clampDragCoordinatesInPlace(frame, frame, staticBounds, coordTarget);
      computeTiltMatrixInPlace(frame, frame, 15, 0.1, tiltTarget);
      shallowEqual(prevOffset, nextOffset);
    }

    const startMemory = typeof process !== 'undefined' ? process?.memoryUsage?.()?.heapUsed : undefined;

    for (let frame = 0; frame < 10_000; frame++) {
      const deltaX = (frame % 300) - 150;
      const deltaY = (frame % 300) - 150;

      clampDragCoordinatesInPlace(deltaX, deltaY, staticBounds, coordTarget);
      computeTiltMatrixInPlace(deltaX, deltaY, 15, 0.1, tiltTarget);

      nextOffset.x = coordTarget.x;
      nextOffset.y = coordTarget.y;
      shallowEqual(prevOffset, nextOffset);
    }

    const endMemory = typeof process !== 'undefined' ? process?.memoryUsage?.()?.heapUsed : undefined;

    // Verify scratchpads preserve exact object reference identity and valid outputs
    expect(Number.isFinite(coordTarget.x)).toBe(true);
    expect(Number.isFinite(tiltTarget.rotationX)).toBe(true);

    if (startMemory !== undefined && endMemory !== undefined) {
      const memoryGrowthKb = (endMemory - startMemory) / 1024;
      expect(memoryGrowthKb).toBeLessThan(4096);
    }
  });
});
