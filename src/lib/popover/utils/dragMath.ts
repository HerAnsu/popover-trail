/**
 * Drag Physics and Math Utilities for popover-trail.
 * Provides coordinate clamping, 3D tilt matrices, and drag friction calculations.
 *
 * @module dragMath
 */

/**
 * Options parameters for coordinate clamping bounds.
 */
export interface ClampBounds {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

function resolveValidBounds(bounds: ClampBounds): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  let minX = bounds.minX !== undefined && Number.isFinite(bounds.minX) ? bounds.minX : -Infinity;
  let maxX = bounds.maxX !== undefined && Number.isFinite(bounds.maxX) ? bounds.maxX : Infinity;
  let minY = bounds.minY !== undefined && Number.isFinite(bounds.minY) ? bounds.minY : -Infinity;
  let maxY = bounds.maxY !== undefined && Number.isFinite(bounds.maxY) ? bounds.maxY : Infinity;

  if (minX > maxX) [minX, maxX] = [maxX, minX];
  if (minY > maxY) [minY, maxY] = [maxY, minY];

  return { minX, maxX, minY, maxY };
}

/**
 * Clamps drag translation coordinates (x, y) within specified minimum/maximum bounds.
 *
 * @param x - Raw X coordinate offset.
 * @param y - Raw Y coordinate offset.
 * @param bounds - Optional min/max boundary limits.
 * @returns Clamped coordinate object { x, y }.
 */
export function clampDragCoordinates(
  x: number,
  y: number,
  bounds?: ClampBounds,
): { x: number; y: number } {
  const out = { x, y };
  if (bounds) clampDragCoordinatesInPlace(x, y, bounds, out);
  return out;
}

function computeRawTiltAngles(
  deltaX: number,
  deltaY: number,
  maxAngle = 15,
  sensitivity = 0.1,
): { rotationX: number; rotationY: number } {
  const safeDeltaX = Number.isFinite(deltaX) ? deltaX : 0;
  const safeDeltaY = Number.isFinite(deltaY) ? deltaY : 0;
  const safeMaxAngle = Number.isFinite(maxAngle) && maxAngle >= 0 ? maxAngle : 15;
  const safeSensitivity = Number.isFinite(sensitivity) ? sensitivity : 0.1;

  const rawX = -safeDeltaY * safeSensitivity;
  const rawY = safeDeltaX * safeSensitivity;

  const rotationX = Math.max(-safeMaxAngle, Math.min(safeMaxAngle, rawX));
  const rotationY = Math.max(-safeMaxAngle, Math.min(safeMaxAngle, rawY));

  return { rotationX, rotationY };
}

/**
 * Computes 3D tilt angles (rotateX, rotateY) based on drag velocity or offset.
 *
 * @param deltaX - X offset delta.
 * @param deltaY - Y offset delta.
 * @param maxAngle - Maximum rotation limit in degrees (default: 15).
 * @param sensitivity - Sensitivity multiplier factor (default: 0.1).
 * @returns Rotation angles object { rotationX, rotationY }.
 */
export function computeTiltMatrix(
  deltaX: number,
  deltaY: number,
  maxAngle = 15,
  sensitivity = 0.1,
): { rotationX: number; rotationY: number } {
  return computeRawTiltAngles(deltaX, deltaY, maxAngle, sensitivity);
}

/**
 * Applies drag friction resistance factor to raw movement deltas.
 *
 * @param delta - Raw movement delta value.
 * @param friction - Resistance coefficient between 0 and 1 (default: 0.5).
 * @returns Resistance-adjusted delta.
 */
export function applyDragFriction(delta: number, friction = 0.5): number {
  return delta * (1 - Math.min(1, Math.max(0, friction)));
}

/**
 * Zero-allocation in-place variant of clampDragCoordinates mutating a target object.
 *
 * @param x - Raw X coordinate offset.
 * @param y - Raw Y coordinate offset.
 * @param bounds - Optional min/max boundary limits.
 * @param outTarget - Target object to mutate with clamped x, y values.
 */
export function clampDragCoordinatesInPlace(
  x: number,
  y: number,
  bounds: ClampBounds | undefined,
  outTarget: { x: number; y: number },
): void {
  if (!bounds) {
    outTarget.x = x;
    outTarget.y = y;
    return;
  }

  const { minX, maxX, minY, maxY } = resolveValidBounds(bounds);
  outTarget.x = Math.max(minX, Math.min(maxX, x));
  outTarget.y = Math.max(minY, Math.min(maxY, y));
}

/**
 * Zero-allocation in-place variant of computeTiltMatrix mutating a target object.
 *
 * @param deltaX - X offset delta.
 * @param deltaY - Y offset delta.
 * @param maxAngle - Maximum rotation limit in degrees (default: 15).
 * @param sensitivity - Sensitivity multiplier factor (default: 0.1).
 * @param outTarget - Target object to mutate with rotationX, rotationY values.
 */
export function computeTiltMatrixInPlace(
  deltaX: number,
  deltaY: number,
  maxAngle = 15,
  sensitivity = 0.1,
  outTarget: { rotationX: number; rotationY: number },
): void {
  const result = computeRawTiltAngles(deltaX, deltaY, maxAngle, sensitivity);
  outTarget.rotationX = result.rotationX;
  outTarget.rotationY = result.rotationY;
}
