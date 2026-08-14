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

function toFiniteOrDefault(val: number | undefined, fallback: number): number {
  return val !== undefined && Number.isFinite(val) ? val : fallback;
}

function resolveValidBounds(bounds: ClampBounds): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  const rawMinX = toFiniteOrDefault(bounds.minX, -Infinity);
  const rawMaxX = toFiniteOrDefault(bounds.maxX, Infinity);
  const rawMinY = toFiniteOrDefault(bounds.minY, -Infinity);
  const rawMaxY = toFiniteOrDefault(bounds.maxY, Infinity);

  return {
    minX: Math.min(rawMinX, rawMaxX),
    maxX: Math.max(rawMinX, rawMaxX),
    minY: Math.min(rawMinY, rawMaxY),
    maxY: Math.max(rawMinY, rawMaxY),
  };
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
  const out = { x: safeX, y: safeY };
  if (bounds) clampDragCoordinatesInPlace(safeX, safeY, bounds, out);
  return out;
}

/**
 * Computes 3D Euler tilt rotation angles (pitch around X-axis, roll around Y-axis)
 * from pointer velocity or drag offsets.
 *
 * Pitch (rotationX): Derived from vertical delta (-deltaY) so dragging down tilts the card backward.
 * Roll (rotationY): Derived from horizontal delta (+deltaX) so dragging right tilts the card rightward.
 *
 * @param deltaX - Horizontal offset delta.
 * @param deltaY - Vertical offset delta.
 * @param maxAngle - Maximum rotation angle ceiling in degrees (default: 15).
 * @param sensitivity - Velocity sensitivity scaling multiplier (default: 0.1).
 */
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

  // Invert deltaY for natural pitch response (dragging down tilts top of card towards user)
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
 * Formula: `delta * (1 - clampedFriction)`
 *
 * @param delta - Raw movement delta value in pixels.
 * @param friction - Resistance coefficient between 0 (no resistance) and 1 (locked) (default: 0.5).
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
  const safeX = Number.isFinite(x) ? x : 0;
  const safeY = Number.isFinite(y) ? y : 0;
  if (!bounds) {
    outTarget.x = safeX;
    outTarget.y = safeY;
    return;
  }

  const { minX, maxX, minY, maxY } = resolveValidBounds(bounds);
  outTarget.x = Math.max(minX, Math.min(maxX, safeX));
  outTarget.y = Math.max(minY, Math.min(maxY, safeY));
}

/**
 * Zero-allocation in-place variant of computeTiltMatrix mutating a target object.
 *
 * @param deltaX - X offset delta.
 * @param deltaY - Y offset delta.
 * @param maxAngle - Maximum rotation limit in degrees.
 * @param sensitivity - Sensitivity multiplier factor.
 * @param outTarget - Target object to mutate with rotation angles.
 */
export function computeTiltMatrixInPlace(
  deltaX: number,
  deltaY: number,
  maxAngle: number,
  sensitivity: number,
  outTarget: { rotationX: number; rotationY: number },
): void {
  const res = computeRawTiltAngles(deltaX, deltaY, maxAngle, sensitivity);
  outTarget.rotationX = res.rotationX;
  outTarget.rotationY = res.rotationY;
}
