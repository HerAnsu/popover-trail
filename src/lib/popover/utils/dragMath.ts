/**
 * Drag Physics and Math Utilities for popover-trail.
 * Provides coordinate clamping, 3D tilt matrices, and drag friction calculations.
 *
 * @module dragMath
 */

import { Point2D } from './valueObjects';

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
  const pt = new Point2D(x, y);
  if (!bounds) return pt.toObject();

  let minX = bounds.minX !== undefined && Number.isFinite(bounds.minX) ? bounds.minX : -Infinity;
  let maxX = bounds.maxX !== undefined && Number.isFinite(bounds.maxX) ? bounds.maxX : Infinity;
  let minY = bounds.minY !== undefined && Number.isFinite(bounds.minY) ? bounds.minY : -Infinity;
  let maxY = bounds.maxY !== undefined && Number.isFinite(bounds.maxY) ? bounds.maxY : Infinity;

  if (minX > maxX) [minX, maxX] = [maxX, minX];
  if (minY > maxY) [minY, maxY] = [maxY, minY];

  return pt.clamp(minX, maxX, minY, maxY).toObject();
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
