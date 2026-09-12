/**
 * Drag Physics and 3D Tilt Calculations.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dragPhysics
 */

import { toFiniteOrDefault, isNonNegativeFinite } from './typeGuards';

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

  out.rotationX = Math.max(-safeMaxAngle, Math.min(safeMaxAngle, rawX));
  out.rotationY = Math.max(-safeMaxAngle, Math.min(safeMaxAngle, rawY));
}

export function computeRawTiltAngles(
  deltaX: number,
  deltaY: number,
  maxAngle = 15,
  sensitivity = 0.1,
): { rotationX: number; rotationY: number } {
  const out = { rotationX: 0, rotationY: 0 };
  computeTiltMatrixInPlace(deltaX, deltaY, maxAngle, sensitivity, out);
  return out;
}

export function computeTiltMatrix(
  deltaX: number,
  deltaY: number,
  maxAngle = 15,
  sensitivity = 0.1,
): { rotationX: number; rotationY: number } {
  return computeRawTiltAngles(deltaX, deltaY, maxAngle, sensitivity);
}

export function applyDragFriction(delta: number, friction = 0.5): number {
  return delta * (1 - Math.min(1, Math.max(0, friction)));
}
