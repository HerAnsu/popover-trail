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
  const safeX = Number.isFinite(x) ? x : 0;
  const safeY = Number.isFinite(y) ? y : 0;
  if (!bounds) return { x: safeX, y: safeY };

  let clampedX = safeX;
  let clampedY = safeY;

  let minX = bounds.minX !== undefined && Number.isFinite(bounds.minX) ? bounds.minX : undefined;
  let maxX = bounds.maxX !== undefined && Number.isFinite(bounds.maxX) ? bounds.maxX : undefined;
  let minY = bounds.minY !== undefined && Number.isFinite(bounds.minY) ? bounds.minY : undefined;
  let maxY = bounds.maxY !== undefined && Number.isFinite(bounds.maxY) ? bounds.maxY : undefined;

  if (minX !== undefined && maxX !== undefined && minX > maxX) {
    [minX, maxX] = [maxX, minX];
  }
  if (minY !== undefined && maxY !== undefined && minY > maxY) {
    [minY, maxY] = [maxY, minY];
  }

  if (minX !== undefined) clampedX = Math.max(minX, clampedX);
  if (maxX !== undefined) clampedX = Math.min(maxX, clampedX);
  if (minY !== undefined) clampedY = Math.max(minY, clampedY);
  if (maxY !== undefined) clampedY = Math.min(maxY, clampedY);

  return { x: clampedX, y: clampedY };
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
 * Applies drag friction resistance factor to raw movement deltas.
 *
 * @param delta - Raw movement delta value.
 * @param friction - Resistance coefficient between 0 and 1 (default: 0.5).
 * @returns Resistance-adjusted delta.
 */
export function applyDragFriction(delta: number, friction = 0.5): number {
  return delta * (1 - Math.min(1, Math.max(0, friction)));
}
