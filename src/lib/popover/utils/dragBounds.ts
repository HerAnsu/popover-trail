/**
 * Drag Coordinate and Spatial Boundary Clamping Operators.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dragBounds
 */

import { toFiniteOrDefault } from './typeGuards';
import { clamp } from './math';
import { toFiniteNumber } from './stylesTransform';

export interface ClampBounds {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
}

export interface DragTransform2D {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
}

export interface DragNodeRect {
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
}

export interface DragBoundsRect {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

/**
 * Clamps 2D coordinates into a reusable destination object with zero heap allocations on hot drag paths.
 * Normalizes non-finite coordinates to zero or bounding boundaries.
 *
 * @param x - Desired horizontal coordinate.
 * @param y - Desired vertical coordinate.
 * @param bounds - Optional bounding constraints (`minX`, `maxX`, `minY`, `maxY`).
 * @param outTarget - Target destination object mutated in-place.
 *
 * @example
 * ```typescript
 * const scratch = { x: 0, y: 0 };
 * clampDragCoordinatesInPlace(150, 80, { minX: 0, maxX: 100, minY: 0, maxY: 100 }, scratch);
 * // scratch => { x: 100, y: 80 }
 * ```
 */
export function clampDragCoordinatesInPlace(
  x: number,
  y: number,
  bounds: ClampBounds | undefined,
  outTarget: { x: number; y: number },
): void {
  const safeX = toFiniteNumber(x);
  const safeY = toFiniteNumber(y);
  if (!bounds) {
    outTarget.x = safeX;
    outTarget.y = safeY;
    return;
  }
  const minX = toFiniteOrDefault(bounds.minX, -Infinity);
  const maxX = toFiniteOrDefault(bounds.maxX, Infinity);
  const minY = toFiniteOrDefault(bounds.minY, -Infinity);
  const maxY = toFiniteOrDefault(bounds.maxY, Infinity);
  outTarget.x = clamp(safeX, minX, maxX);
  outTarget.y = clamp(safeY, minY, maxY);
}

/**
 * Constrains coordinate pair `(x, y)` within rectangular boundaries.
 *
 * @param x - Raw X coordinate.
 * @param y - Raw Y coordinate.
 * @param bounds - Optional rectangular boundary limits.
 * @returns New clamped coordinate vector `{ x, y }`.
 *
 * @example
 * ```typescript
 * const clamped = clampDragCoordinates(250, -50, { minX: 0, maxX: 200, minY: 0, maxY: 200 });
 * // => { x: 200, y: 0 }
 * ```
 */
export function clampDragCoordinates(
  x: number,
  y: number,
  bounds?: ClampBounds,
): { x: number; y: number } {
  const safeX = Number.isFinite(x) ? x : 0;
  const safeY = Number.isFinite(y) ? y : 0;
  const out = { x: 0, y: 0 };
  clampDragCoordinatesInPlace(safeX, safeY, bounds, out);
  return out;
}

/**
 * Constructs a 2D drag offset object `{ x, y }`.
 *
 * @param x - Horizontal offset.
 * @param y - Vertical offset.
 * @returns 2D offset vector.
 *
 * @example
 * ```typescript
 * const offset = toDragOffset(15, 25);
 * ```
 */
export function toDragOffset(x: number, y: number): { x: number; y: number } {
  return { x, y };
}

/**
 * Determines whether two 2D drag offset vectors are value-equal.
 *
 * @param a - First offset vector.
 * @param b - Second offset vector.
 * @returns True if both coordinates match exactly.
 *
 * @example
 * ```typescript
 * isDragOffsetEqual({ x: 10, y: 20 }, { x: 10, y: 20 }); // => true
 * isDragOffsetEqual({ x: 10, y: 20 }, { x: 5, y: 20 });  // => false
 * ```
 */
export function isDragOffsetEqual(
  a?: { x: number; y: number } | null,
  b?: { x: number; y: number } | null,
): boolean {
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y;
}

export {
  clampCoordinateToBounds,
  clampToViewport,
  clampToContainer,
  boundaryProximity,
} from './dragRectClamping';
