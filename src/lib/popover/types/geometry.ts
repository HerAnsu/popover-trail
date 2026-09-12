/**
 * Structural 2D Bounding Box and Coordinate Types decoupled from DOM interfaces.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module types/geometry
 */

export interface PopoverRect {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
  readonly bottom?: number;
  readonly right?: number;
  readonly x?: number;
  readonly y?: number;
}

export type DragOffset = { readonly x: number; readonly y: number };

export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export interface Vector2D {
  readonly dx: number;
  readonly dy: number;
}
