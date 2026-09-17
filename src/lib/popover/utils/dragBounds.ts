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

export function toDragOffset(x: number, y: number): { x: number; y: number } {
  return { x, y };
}

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
  computeBoundaryProximityRatio,
} from './dragRectClamping';
