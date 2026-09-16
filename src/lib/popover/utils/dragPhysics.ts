/**
 * Drag Physics and 3D Tilt Calculations.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dragPhysics
 */

import { toFiniteOrDefault, isNonNegativeFinite } from './typeGuards';
import { clamp, lerp } from './math';

export function normalizeDragDelta(
  deltaX: number,
  deltaY: number,
  scale = 1,
): { x: number; y: number } {
  const out = { x: 0, y: 0 };
  normalizeDragDeltaInto(deltaX, deltaY, scale, out);
  return out;
}

export function normalizeDragDeltaInto(
  deltaX: number,
  deltaY: number,
  scale = 1,
  out: { x: number; y: number },
): void {
  const safeScale = scale > 0 && Number.isFinite(scale) ? scale : 1;
  const rawX = toFiniteOrDefault(deltaX, 0) / safeScale;
  const rawY = toFiniteOrDefault(deltaY, 0) / safeScale;
  out.x = toFiniteOrDefault(rawX, 0);
  out.y = toFiniteOrDefault(rawY, 0);
}

export function computeTiltMatrixInPlace(
  deltaX: number,
  deltaY: number,
  maxAngle: number,
  sensitivity: number,
  out: { rotationX: number; rotationY: number },
): void {
  const safeDeltaX = toFiniteOrDefault(deltaX, 0);
  const safeDeltaY = toFiniteOrDefault(deltaY, 0);
  const safeMaxAngle = isNonNegativeFinite(maxAngle) ? maxAngle : 15;
  const safeSensitivity = toFiniteOrDefault(sensitivity, 0.1);

  const rawX = -safeDeltaY * safeSensitivity;
  const rawY = safeDeltaX * safeSensitivity;

  out.rotationX = clamp(rawX, -safeMaxAngle, safeMaxAngle);
  out.rotationY = clamp(rawY, -safeMaxAngle, safeMaxAngle);
}

/**
 * Computes 3D tilt rotation angles in degrees for interactive pointer dragging.
 *
 * @param deltaX - Horizontal drag displacement from initial grab coordinate.
 * @param deltaY - Vertical drag displacement from initial grab coordinate.
 * @param maxAngle - Upper threshold clamping maximum 3D rotation in degrees (default 15).
 * @param sensitivity - Multiplier for converting pixel offsets into degrees (default 0.1).
 * @returns Object with calculated `rotationX` and `rotationY` degrees.
 */
export function computeTiltMatrix(
  deltaX: number,
  deltaY: number,
  maxAngle = 15,
  sensitivity = 0.1,
): { rotationX: number; rotationY: number } {
  const out = { rotationX: 0, rotationY: 0 };
  computeTiltMatrixInPlace(deltaX, deltaY, maxAngle, sensitivity, out);
  return out;
}

export function applyDragFriction(delta: number, friction = 0.5): number {
  return lerp(delta, 0, clamp(friction, 0, 1));
}
