/**
 * Immutable 2D Spatial Coordinate Vector Value Object.
 * Encapsulates coordinate transformations, distance calculations, and clamping with NaN-safety.
 *
 * @module utils/Point2D
 */

import { clamp } from './math';
import { toFiniteNumber } from './stylesTransform';

function resolveCoords(pt?: { x?: number; y?: number } | null): { x: number; y: number } {
  return { x: toFiniteNumber(pt?.x), y: toFiniteNumber(pt?.y) };
}

/**
 * Immutable 2D spatial coordinate vector value object.
 * Encapsulates coordinate transformations, distance calculations, and clamping with NaN/infinite-safety.
 *
 * @example
 * ```typescript
 * const p1 = Point2D.of(10, 20);
 * const p2 = p1.add({ x: 5, y: -5 }); // Point2D(15, 15)
 * const dist = p1.distanceTo(p2);
 * ```
 */
export class Point2D {
  readonly x: number;
  readonly y: number;

  /**
   * Constructs a 2D coordinate point, sanitizing non-finite coordinates to 0.
   *
   * @param x - Horizontal coordinate.
   * @param y - Vertical coordinate.
   */
  constructor(x: number, y: number) {
    this.x = toFiniteNumber(x);
    this.y = toFiniteNumber(y);
  }

  private static readonly ZERO = new Point2D(0, 0);

  /**
   * Returns a singleton immutable point at origin (0, 0).
   *
   * @returns Zero vector point.
   */
  static zero(): Point2D {
    return Point2D.ZERO;
  }

  /**
   * Factory producing a new Point2D instance.
   *
   * @param x - Horizontal coordinate.
   * @param y - Vertical coordinate.
   * @returns New Point2D.
   *
   * @example
   * ```typescript
   * const pt = Point2D.of(100, 200);
   * ```
   */
  static of(x: number, y: number): Point2D {
    return new Point2D(x, y);
  }

  /**
   * Creates a Point2D from an object containing x and y coordinates.
   *
   * @param obj - Object with optional x and y properties.
   * @returns New Point2D.
   *
   * @example
   * ```typescript
   * const pt = Point2D.fromObject({ x: 40, y: 80 });
   * ```
   */
  static fromObject(obj?: { x?: number; y?: number } | null): Point2D {
    const { x, y } = resolveCoords(obj);
    return new Point2D(x, y);
  }

  /**
   * Adds another coordinate vector to this point and returns the sum as a new Point2D.
   *
   * @param other - Vector to add.
   * @returns New Point2D representing the translated coordinates.
   *
   * @example
   * ```typescript
   * const translated = pt.add({ x: 10, y: 20 });
   * ```
   */
  add(other: Point2D | { x: number; y: number }): Point2D {
    const { x, y } = resolveCoords(other);
    return new Point2D(this.x + x, this.y + y);
  }

  /**
   * Subtracts another coordinate vector from this point.
   *
   * @param other - Vector to subtract.
   * @returns New Point2D representing the relative vector.
   *
   * @example
   * ```typescript
   * const delta = current.subtract(origin);
   * ```
   */
  subtract(other: Point2D | { x: number; y: number }): Point2D {
    const { x, y } = resolveCoords(other);
    return new Point2D(this.x - x, this.y - y);
  }

  /**
   * Calculates the Euclidean distance from this point to another point.
   *
   * @param other - Target point.
   * @returns Euclidean distance in pixels.
   *
   * @example
   * ```typescript
   * const distance = ptA.distanceTo(ptB);
   * ```
   */
  distanceTo(other: Point2D | { x: number; y: number }): number {
    const { x, y } = resolveCoords(other);
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Clamps this point's coordinates within rectangular min/max boundaries.
   *
   * @param minX - Lower horizontal bound.
   * @param maxX - Upper horizontal bound.
   * @param minY - Lower vertical bound.
   * @param maxY - Upper vertical bound.
   * @returns Clamped Point2D.
   *
   * @example
   * ```typescript
   * const clamped = pt.clamp(0, window.innerWidth, 0, window.innerHeight);
   * ```
   */
  clamp(minX: number, maxX: number, minY: number, maxY: number): Point2D {
    const clampedX = clamp(this.x, minX, maxX);
    const clampedY = clamp(this.y, minY, maxY);
    return new Point2D(clampedX, clampedY);
  }

  /**
   * Tests whether this point is identical to another coordinate pair.
   *
   * @param other - Target point to compare.
   * @returns True if both x and y match.
   */
  equals(other?: { x: number; y: number } | null): boolean {
    if (!other) return false;
    return this.x === other.x && this.y === other.y;
  }

  /**
   * Converts this value object into a plain JavaScript coordinate object `{ x, y }`.
   *
   * @returns Plain `{ x, y }` object.
   */
  toObject(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}
