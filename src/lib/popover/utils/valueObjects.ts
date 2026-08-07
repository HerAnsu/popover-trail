/**
 * Immutable Geometry Value Objects for popover-trail.
 * Encapsulates spatial math, coordinate transformations, and bounding box checks
 * with fail-safe NaN/Infinity validation guards.
 *
 * @module valueObjects
 */

/**
 * Immutable 2D Spatial Coordinate Vector Value Object.
 */
export class Point2D {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = Number.isFinite(x) ? x : 0;
    this.y = Number.isFinite(y) ? y : 0;
  }

  static zero(): Point2D {
    return new Point2D(0, 0);
  }

  static of(x: number, y: number): Point2D {
    return new Point2D(x, y);
  }

  static fromObject(obj?: { x?: number; y?: number } | null): Point2D {
    if (!obj) return Point2D.zero();
    return new Point2D(obj.x ?? 0, obj.y ?? 0);
  }

  add(other: Point2D | { x: number; y: number }): Point2D {
    return new Point2D(this.x + (other.x ?? 0), this.y + (other.y ?? 0));
  }

  subtract(other: Point2D | { x: number; y: number }): Point2D {
    return new Point2D(this.x - (other.x ?? 0), this.y - (other.y ?? 0));
  }

  clamp(minX: number, maxX: number, minY: number, maxY: number): Point2D {
    const clampedX = Math.max(minX, Math.min(maxX, this.x));
    const clampedY = Math.max(minY, Math.min(maxY, this.y));
    return new Point2D(clampedX, clampedY);
  }

  equals(other?: { x: number; y: number } | null): boolean {
    if (!other) return false;
    return this.x === other.x && this.y === other.y;
  }

  toObject(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }
}

/**
 * Immutable Spatial Bounding Box Rect Value Object.
 */
export class RectBounds {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;

  constructor(top: number, left: number, width: number, height: number) {
    this.top = Number.isFinite(top) ? top : 0;
    this.left = Number.isFinite(left) ? left : 0;
    this.width = Number.isFinite(width) && width >= 0 ? width : 0;
    this.height = Number.isFinite(height) && height >= 0 ? height : 0;
  }

  get right(): number {
    return this.left + this.width;
  }

  get bottom(): number {
    return this.top + this.height;
  }

  get center(): Point2D {
    return new Point2D(this.left + this.width / 2, this.top + this.height / 2);
  }

  static fromDOMRect(rect?: DOMRect | null): RectBounds {
    if (!rect) return new RectBounds(0, 0, 0, 0);
    return new RectBounds(rect.top, rect.left, rect.width, rect.height);
  }

  static of(top: number, left: number, width: number, height: number): RectBounds {
    return new RectBounds(top, left, width, height);
  }

  contains(point: Point2D | { x: number; y: number }): boolean {
    const px = point.x;
    const py = point.y;
    return px >= this.left && px <= this.right && py >= this.top && py <= this.bottom;
  }

  intersects(other: RectBounds): boolean {
    return (
      this.left < other.right &&
      this.right > other.left &&
      this.top < other.bottom &&
      this.bottom > other.top
    );
  }

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
