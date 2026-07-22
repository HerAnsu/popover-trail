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
 */
export function clampDragCoordinates(
  x: number,
  y: number,
  bounds?: ClampBounds,
): { x: number; y: number } {
  if (!bounds) return { x, y };

  let clampedX = x;
  let clampedY = y;

  if (bounds.minX !== undefined) clampedX = Math.max(bounds.minX, clampedX);
  if (bounds.maxX !== undefined) clampedX = Math.min(bounds.maxX, clampedX);
  if (bounds.minY !== undefined) clampedY = Math.max(bounds.minY, clampedY);
  if (bounds.maxY !== undefined) clampedY = Math.min(bounds.maxY, clampedY);

  if (clampedX === x && clampedY === y) {
    return { x, y };
  }

  return { x: clampedX, y: clampedY };
}

/**
 * Computes 3D tilt angles (rotateX, rotateY) based on drag velocity or offset.
 */
export function computeTiltMatrix(
  deltaX: number,
  deltaY: number,
  maxAngle = 15,
  sensitivity = 0.1,
): { rotationX: number; rotationY: number } {
  const rawX = -deltaY * sensitivity;
  const rawY = deltaX * sensitivity;

  const rotationX = Math.max(-maxAngle, Math.min(maxAngle, rawX));
  const rotationY = Math.max(-maxAngle, Math.min(maxAngle, rawY));

  return { rotationX, rotationY };
}

/**
 * Applies drag friction resistance factor to raw movement deltas.
 */
export function applyDragFriction(delta: number, friction = 0.5): number {
  return delta * (1 - Math.min(1, Math.max(0, friction)));
}
