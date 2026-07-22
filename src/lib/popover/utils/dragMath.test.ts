import { describe, it, expect } from 'vitest';
import { computeTiltMatrix } from './dragMath';

describe('dragMath - computeTiltMatrix', () => {
  it('returns zero rotation angles when velocity is zero', () => {
    const result = computeTiltMatrix(0, 0, 5, 8);
    expect(Math.abs(result.rotationX)).toBe(0);
    expect(Math.abs(result.rotationY)).toBe(0);
  });

  it('calculates tilt rotation based on X and Y velocity', () => {
    const result = computeTiltMatrix(10, -5, 10, 8);
    expect(typeof result.rotationX).toBe('number');
    expect(typeof result.rotationY).toBe('number');
    expect(result.rotationY).toBeGreaterThan(0);
  });

  it('clamps maximum tilt angle within maxTiltAngle bounds', () => {
    const maxAngle = 5;
    const extremeResult = computeTiltMatrix(1000, 1000, maxAngle, 20);

    expect(Math.abs(extremeResult.rotationX)).toBeLessThanOrEqual(maxAngle);
    expect(Math.abs(extremeResult.rotationY)).toBeLessThanOrEqual(maxAngle);
  });
});
