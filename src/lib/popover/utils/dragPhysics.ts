/**
 * Drag Physics and 3D Tilt Calculations.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dragPhysics
 */

import { toFiniteOrDefault, isNonNegativeFinite } from './typeGuards';
import { clamp, lerp } from './math';

/**
 * Normalizes raw pointer drag deltas taking into account canvas or container CSS scale factors.
 *
 * @example
 * ```ts
 * const delta = normalizeDragDelta(20, 40, 2); // => { x: 10, y: 20 }
 * ```
 *
 * @param deltaX - Raw horizontal mouse/touch pixel delta.
 * @param deltaY - Raw vertical mouse/touch pixel delta.
 * @param scale - CSS zoom/scale transform factor of the container (default 1).
 * @returns Normalized coordinate offset object.
 */
export function normalizeDragDelta(
  deltaX: number,
  deltaY: number,
  scale = 1,
): { x: number; y: number } {
  const out = { x: 0, y: 0 };
  normalizeDragDeltaInto(deltaX, deltaY, scale, out);
  return out;
}

/**
 * Mutates target coordinate object in-place with normalized drag deltas to avoid heap allocations.
 *
 * @example
 * ```ts
 * const scratch = { x: 0, y: 0 };
 * normalizeDragDeltaInto(30, 60, 1.5, scratch);
 * // scratch => { x: 20, y: 40 }
 * ```
 *
 * @param deltaX - Raw horizontal drag delta.
 * @param deltaY - Raw vertical drag delta.
 * @param scale - Container CSS scale factor.
 * @param out - Destination object to write normalized x and y into.
 */
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

/**
 * Computes 3D tilt rotation angles in degrees directly into a reusable destination object.
 *
 * @remarks
 * Produces zero heap allocations on high-frequency pointermove / animation frame events.
 *
 * @param deltaX - Horizontal drag displacement from initial grab point.
 * @param deltaY - Vertical drag displacement from initial grab point.
 * @param maxAngle - Upper angle threshold in degrees clamping the maximum tilt.
 * @param sensitivity - Sensitivity multiplier for converting pixel delta into degrees.
 * @param out - Destination object to receive rotationX and rotationY.
 */
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
 * @example
 * ```ts
 * const tilt = computeTiltMatrix(10, -15, 12, 0.08);
 * // apply to card style: `transform: perspective(600px) rotateX(${tilt.rotationX}deg) rotateY(${tilt.rotationY}deg)`
 * ```
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

/**
 * Applies physical resistance/friction factor to a drag displacement value.
 *
 * @example
 * ```ts
 * const resisted = applyDragFriction(100, 0.4); // => 60
 * ```
 *
 * @param delta - Input displacement distance.
 * @param friction - Resistance coefficient between 0 (no resistance) and 1 (full lock).
 * @returns Damped displacement value.
 */
export function applyDragFriction(delta: number, friction = 0.5): number {
  return lerp(delta, 0, clamp(friction, 0, 1));
}

