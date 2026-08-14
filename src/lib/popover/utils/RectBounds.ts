import { Point2D } from './Point2D';

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
    if (!point) return false;
    const px = point.x;
    const py = point.y;
    if (!Number.isFinite(px) || !Number.isFinite(py)) return false;
    return px >= this.left && px <= this.right && py >= this.top && py <= this.bottom;
  }

  intersects(other?: RectBounds | null): boolean {
    if (!other) return false;
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
