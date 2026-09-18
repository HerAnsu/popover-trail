/**
 * 2D Spatial Bounds, Bounding Box and QuadTree Geometry Guards.
 *
 * @module utils/guards/spatialGuards
 */

import { isFiniteNumber, isNonNegativeFinite } from './numberGuards';
import { isNonEmptyString, isRecordObject } from './stringGuards';

/** Bounding box rectangle dimensions. */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Item node stored within a QuadTree spatial region.
 *
 * @template TId - Unique identifier type.
 */
export interface QuadItem<TId extends string = string> {
  id: TId;
  bounds: BoundingBox;
}

/**
 * Type guard validating that a value is a well-formed BoundingBox with finite coordinates
 * and non-negative dimensions.
 */
export function isValidBoundingBox(bounds: unknown): bounds is BoundingBox {
  return (
    isRecordObject(bounds) &&
    isFiniteNumber(bounds.x) &&
    isFiniteNumber(bounds.y) &&
    isNonNegativeFinite(bounds.width) &&
    isNonNegativeFinite(bounds.height)
  );
}

/**
 * Type guard validating that an item node has a valid non-empty identifier and valid bounding box.
 */
export function isValidQuadItem<TId extends string = string>(item: unknown): item is QuadItem<TId> {
  return isRecordObject(item) && isNonEmptyString(item.id) && isValidBoundingBox(item.bounds);
}

/**
 * Determines whether two 2D bounding boxes intersect.
 * Correctly handles zero-dimension bounds (points and edges) using inclusive boundaries.
 */
export function boxesIntersect(a: BoundingBox, b: BoundingBox): boolean {
  if (!a || !b) return false;

  const { x: ax, y: ay, width: aw, height: ah } = a;
  const { x: bx, y: by, width: bw, height: bh } = b;

  const isPointOrEdgeA = aw === 0 || ah === 0;
  const isPointOrEdgeB = bw === 0 || bh === 0;

  if (isPointOrEdgeA || isPointOrEdgeB) {
    return (
      ax <= bx + bw && ax + aw >= bx && ay <= by + bh && ay + ah >= by
    );
  }

  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
