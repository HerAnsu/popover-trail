/**
 * Immutable Spatial Bounding Box Rect Value Object.
 * Encapsulates rectangle geometry, containment testing, and intersection collision detection.
 *
 * @module utils/RectBounds
 */

import { Point2D } from './Point2D';

/**
 * Immutable spatial bounding box rectangle value object.
 * Encapsulates rectangle geometry, containment testing, and intersection collision detection with NaN-safety.
 *
 * @example
 * ```typescript
 * const rect = RectBounds.of(10, 20, 100, 50);
 * console.log(rect.right); // 120
 * console.log(rect.center); // Point2D(70, 35)
 * const inside = rect.contains(Point2D.of(50, 30)); // true
 * ```
 */
export class RectBounds {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;

  /**
   * Constructs a RectBounds value object, sanitizing non-finite coordinates or negative dimensions to 0.
   *
   * @param top - Top vertical boundary coordinate.
   * @param left - Left horizontal boundary coordinate.
   * @param width - Rectangle width (clamped to non-negative finite).
   * @param height - Rectangle height (clamped to non-negative finite).
   */
  constructor(top: number, left: number, width: number, height: number) {
    this.top = Number.isFinite(top) ? top : 0;
    this.left = Number.isFinite(left) ? left : 0;
    this.width = Number.isFinite(width) && width >= 0 ? width : 0;
    this.height = Number.isFinite(height) && height >= 0 ? height : 0;
  }

  /**
   * Computed right coordinate boundary (`left + width`).
   */
  get right(): number {
    return this.left + this.width;
  }

  /**
   * Computed bottom coordinate boundary (`top + height`).
   */
  get bottom(): number {
    return this.top + this.height;
  }

  /**
   * Geometric centroid of this bounding box as a Point2D.
   */
  get center(): Point2D {
    return new Point2D(this.left + this.width / 2, this.top + this.height / 2);
  }

  /**
   * Creates a RectBounds from a browser DOMRect or partial DOMRect object.
   *
   * @param rect - DOMRect instance or compatible object.
   * @returns RectBounds instance.
   *
   * @example
   * ```typescript
   * const bounds = RectBounds.fromDOMRect(element.getBoundingClientRect());
   * ```
   */
  static fromDOMRect(rect?: DOMRect | Partial<DOMRect> | null): RectBounds {
    if (!rect) return new RectBounds(0, 0, 0, 0);
    return new RectBounds(
      rect.top ?? rect.y ?? 0,
      rect.left ?? rect.x ?? 0,
      rect.width ?? 0,
      rect.height ?? 0,
    );
  }

  /**
   * Factory producing a new RectBounds from explicit coordinates.
   *
   * @param top - Top coordinate.
   * @param left - Left coordinate.
   * @param width - Rectangle width.
   * @param height - Rectangle height.
   * @returns RectBounds instance.
   */
  static of(top: number, left: number, width: number, height: number): RectBounds {
    return new RectBounds(top, left, width, height);
  }

  /**
   * Tests whether a given point is contained within this rectangle.
   *
   * @param point - Point2D or coordinate object to test.
   * @returns True if the point lies inside or on the boundaries of this rectangle.
   *
   * @example
   * ```typescript
   * const hit = bounds.contains({ x: 100, y: 150 });
   * ```
   */
  contains(point?: Point2D | { x: number; y: number } | null): boolean {
    if (!point) return false;
    const { x, y } = point;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
  }

  /**
   * Tests whether this rectangle intersects with another rectangle.
   *
   * @param other - Other RectBounds to test intersection with.
   * @returns True if both rectangles overlap.
   *
   * @example
   * ```typescript
   * const collision = rectA.intersects(rectB);
   * ```
   */
  intersects(other?: RectBounds | null): boolean {
    if (!other) return false;
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    );
  }

  /**
   * Converts this value object into a DOMRect or DOMRect-compatible representation.
   *
   * @returns DOMRect object.
   */
  toDOMRect(): DOMRect {
    if (typeof DOMRect !== 'undefined') {
      return new DOMRect(this.left, this.top, this.width, this.height);
    }
    return {
      top: this.top,
      left: this.left,
      width: this.width,
      height: this.height,
      right: this.right,
      bottom: this.bottom,
      x: this.left,
      y: this.top,
      toJSON: () => ({}),
    } satisfies DOMRect;
  }
}
