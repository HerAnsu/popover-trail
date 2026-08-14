function resolvePointCoordinates(other?: { x?: number; y?: number } | null): {
  x: number;
  y: number;
} {
  return { x: other?.x ?? 0, y: other?.y ?? 0 };
}

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

  private static readonly ZERO = new Point2D(0, 0);

  static zero(): Point2D {
    return Point2D.ZERO;
  }

  static of(x: number, y: number): Point2D {
    return new Point2D(x, y);
  }

  static fromObject(obj?: { x?: number; y?: number } | null): Point2D {
    const { x, y } = resolvePointCoordinates(obj);
    return new Point2D(x, y);
  }

  add(other: Point2D | { x: number; y: number }): Point2D {
    const { x, y } = resolvePointCoordinates(other);
    return new Point2D(this.x + x, this.y + y);
  }

  subtract(other: Point2D | { x: number; y: number }): Point2D {
    const { x, y } = resolvePointCoordinates(other);
    return new Point2D(this.x - x, this.y - y);
  }

  /** Calculates the Euclidean distance to another 2D point coordinate. */
  distanceTo(other: Point2D | { x: number; y: number }): number {
    const { x, y } = resolvePointCoordinates(other);
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy);
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
