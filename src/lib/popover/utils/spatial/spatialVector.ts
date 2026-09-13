/**
 * 2D Vector & Coordinate Geometry Algebra with Zero-GC In-Place Primitives.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialVector
 */

import type { Point2D } from './spatialEnergy';
import { toFiniteNumber } from '../stylesTransform';
import { clamp } from '../math';

export function createPoint2D(x = 0, y = 0): Point2D {
  return {
    x: toFiniteNumber(x, 0),
    y: toFiniteNumber(y, 0),
  };
}

export function distanceSquared2D(a: Point2D, b: Point2D): number {
  const dx = toFiniteNumber(a.x) - toFiniteNumber(b.x);
  const dy = toFiniteNumber(a.y) - toFiniteNumber(b.y);
  return dx * dx + dy * dy;
}

export function distance2D(a: Point2D, b: Point2D): number {
  return Math.sqrt(distanceSquared2D(a, b));
}

export function manhattanDistance2D(a: Point2D, b: Point2D): number {
  return (
    Math.abs(toFiniteNumber(a.x) - toFiniteNumber(b.x)) +
    Math.abs(toFiniteNumber(a.y) - toFiniteNumber(b.y))
  );
}

export function vectorLength2D(v: Point2D): number {
  const x = toFiniteNumber(v.x);
  const y = toFiniteNumber(v.y);
  return Math.sqrt(x * x + y * y);
}

export function dotProduct2D(a: Point2D, b: Point2D): number {
  return toFiniteNumber(a.x) * toFiniteNumber(b.x) + toFiniteNumber(a.y) * toFiniteNumber(b.y);
}

export function addPoints2DInto(a: Point2D, b: Point2D, out: { x: number; y: number }): void {
  out.x = toFiniteNumber(a.x) + toFiniteNumber(b.x);
  out.y = toFiniteNumber(a.y) + toFiniteNumber(b.y);
}

export function addPoints2D(a: Point2D, b: Point2D): Point2D {
  const out = { x: 0, y: 0 };
  addPoints2DInto(a, b, out);
  return out;
}

export function subtractPoints2DInto(a: Point2D, b: Point2D, out: { x: number; y: number }): void {
  out.x = toFiniteNumber(a.x) - toFiniteNumber(b.x);
  out.y = toFiniteNumber(a.y) - toFiniteNumber(b.y);
}

export function subtractPoints2D(a: Point2D, b: Point2D): Point2D {
  const out = { x: 0, y: 0 };
  subtractPoints2DInto(a, b, out);
  return out;
}

export function scalePoint2DInto(p: Point2D, factor: number, out: { x: number; y: number }): void {
  const f = toFiniteNumber(factor, 1);
  out.x = toFiniteNumber(p.x) * f;
  out.y = toFiniteNumber(p.y) * f;
}

export function scalePoint2D(p: Point2D, factor: number): Point2D {
  const out = { x: 0, y: 0 };
  scalePoint2DInto(p, factor, out);
  return out;
}

export function lerpPoint2DInto(
  a: Point2D,
  b: Point2D,
  t: number,
  out: { x: number; y: number },
): void {
  const safeT = clamp(toFiniteNumber(t, 0), 0, 1);
  out.x = toFiniteNumber(a.x) + (toFiniteNumber(b.x) - toFiniteNumber(a.x)) * safeT;
  out.y = toFiniteNumber(a.y) + (toFiniteNumber(b.y) - toFiniteNumber(a.y)) * safeT;
}

export function lerpPoint2D(a: Point2D, b: Point2D, t: number): Point2D {
  const out = { x: 0, y: 0 };
  lerpPoint2DInto(a, b, t, out);
  return out;
}
