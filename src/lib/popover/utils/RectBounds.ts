import { Point2D } from './Point2D';

/**
 * Immutable Spatial Bounding Box Rect Value Object.
 * Encapsulates rectangle geometry, containment testing, and intersection collision detection.
 *
 * @example
 * ```typescript
 * const rect = RectBounds.of(10, 20, 200, 100);
 * console.log(rect.right, rect.bottom); // 220, 110
 * const inside = rect.contains({ x: 50, y: 50 }); // true
 * ```
 */
export class RectBounds {
  /** Top boundary edge coordinate in pixels. */
  readonly top: number;
  /** Left boundary edge coordinate in pixels. */
  readonly left: number;
  /** Bounding box width dimension in pixels. */
  readonly width: number;
  /** Bounding box height dimension in pixels. */
  readonly height: number;

  constructor(top: number, left: number, width: number, height: number) {
    this.top = Number.isFinite(top) ? top : 0;
    this.left = Number.isFinite(left) ? left : 0;
    this.width = Number.isFinite(width) && width >= 0 ? width : 0;
    this.height = Number.isFinite(height) && height >= 0 ? height : 0;
  }

  /** Right boundary edge coordinate (left + width). */
  get right(): number {
    return this.left + this.width;
  }

  /** Bottom boundary edge coordinate (top + height). */
  get bottom(): number {
    return this.top + this.height;
  }

  /** Center spatial coordinate point of the bounding box. */
  get center(): Point2D {
    return new Point2D(this.left + this.width / 2, this.top + this.height / 2);
  }

  /** Constructs a RectBounds from a standard DOMRect object or rect-like dictionary. */
  static fromDOMRect(rect?: DOMRect | Partial<DOMRect> | null): RectBounds {
    if (!rect) return new RectBounds(0, 0, 0, 0);
    const top = rect.top ?? rect.y ?? 0;
    const left = rect.left ?? rect.x ?? 0;
    const width = rect.width ?? 0;
    const height = rect.height ?? 0;
    return new RectBounds(top, left, width, height);
  }

  /** Factory creating a RectBounds instance. */
  static of(top: number, left: number, width: number, height: number): RectBounds {
    return new RectBounds(top, left, width, height);
  }

  /** Checks if a 2D point coordinate lies inside this bounding box (inclusive). */
  contains(point?: Point2D | { x: number; y: number } | null): boolean {
    if (!point) return false;
    const px = point.x;
    const py = point.y;
    if (!Number.isFinite(px) || !Number.isFinite(py)) return false;
    return px >= this.left && px <= this.right && py >= this.top && py <= this.bottom;
  }

  /**
   * Checks whether this bounding box overlaps with another bounding box.
   *
   * @param other - Other bounding box.
   * @returns `true` if boxes intersect.
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
   * Converts this RectBounds into a standard browser `DOMRect` instance.
   *
   * @returns `DOMRect` representation.
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
