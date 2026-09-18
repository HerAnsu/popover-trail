/**
 * Structural 2D Bounding Box and Coordinate Types decoupled from DOM interfaces.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module types/geometry
 */

/**
 * Bounding rectangle coordinates and dimensions decoupled from DOM interfaces.
 */
export interface PopoverRect {
  /** Top edge Y coordinate in pixels. */
  readonly top: number;
  /** Left edge X coordinate in pixels. */
  readonly left: number;
  /** Width in pixels. */
  readonly width: number;
  /** Height in pixels. */
  readonly height: number;
  /** Optional bottom edge Y coordinate. */
  readonly bottom?: number;
  /** Optional right edge X coordinate. */
  readonly right?: number;
  /** Optional X coordinate. */
  readonly x?: number;
  /** Optional Y coordinate. */
  readonly y?: number;
}

/**
 * 2D translation offset applied during card dragging.
 */
export type DragOffset = { readonly x: number; readonly y: number };

/**
 * Pure 2D coordinate point `(x, y)`.
 */
export interface Point2D {
  readonly x: number;
  readonly y: number;
}

/**
 * 2D displacement vector `(dx, dy)`.
 */
export interface Vector2D {
  readonly dx: number;
  readonly dy: number;
}
