/**
 * Axis-Aligned Rectangle Clamping and Container Bounds Projection.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dragRectClamping
 */

import { isBrowser } from './typeGuards';
import { clamp, normalizeRatio } from './math';
import type { DragTransform2D, DragNodeRect, DragBoundsRect } from './dragBounds';

/**
 * Constrains drag transform coordinates relative to an active DOM node rectangle and bounding box.
 * Guarantees that dragging the node will never push any of its edges outside `bounds`.
 *
 * @param transform - Current drag transform with 2D translation and scale.
 * @param activeNodeRect - Bounding client rectangle of the dragged DOM node.
 * @param bounds - Outer boundary rectangle constraining movement.
 * @returns Updated `DragTransform2D` with clamped coordinates.
 *
 * @example
 * ```typescript
 * const clamped = clampCoordinateToBounds(
 *   { x: 50, y: 120, scaleX: 1, scaleY: 1 },
 *   { top: 100, left: 100, bottom: 200, right: 300, width: 200, height: 100 },
 *   { top: 0, left: 0, bottom: 800, right: 1200 },
 * );
 * ```
 */
export function clampCoordinateToBounds(
  transform: DragTransform2D,
  activeNodeRect: DragNodeRect,
  bounds: DragBoundsRect,
): DragTransform2D {
  const minX = bounds.left - activeNodeRect.left;
  const maxX = bounds.right - activeNodeRect.left - activeNodeRect.width;
  const minY = bounds.top - activeNodeRect.top;
  const maxY = bounds.bottom - activeNodeRect.top - activeNodeRect.height;

  return {
    ...transform,
    x: clamp(transform.x, minX, maxX),
    y: clamp(transform.y, minY, maxY),
    scaleX: transform.scaleX,
    scaleY: transform.scaleY,
  };
}

/**
 * Clamps drag transform coordinates to keep the active node entirely within viewport boundaries.
 * In SSR / non-browser environments, safely falls back to a standard 1920x1080 viewport.
 *
 * @param transform - Current drag transform.
 * @param activeNodeRect - Bounding rectangle of the dragged node.
 * @returns Clamped transform constrained to viewport dimensions.
 *
 * @example
 * ```typescript
 * const viewportClamped = clampToViewport(dragTransform, nodeRect);
 * ```
 */
export function clampToViewport(
  transform: DragTransform2D,
  activeNodeRect: DragNodeRect,
): DragTransform2D {
  const windowWidth = isBrowser() ? window.innerWidth : 1920;
  const windowHeight = isBrowser() ? window.innerHeight : 1080;
  return clampCoordinateToBounds(transform, activeNodeRect, {
    left: 0,
    top: 0,
    right: windowWidth,
    bottom: windowHeight,
  });
}

/**
 * Clamps drag transform coordinates to keep the active node within container element boundaries.
 *
 * @param transform - Current drag transform.
 * @param activeNodeRect - Bounding rectangle of the dragged node.
 * @param containerRect - Bounding rectangle of the enclosing container element.
 * @returns Clamped transform constrained to container boundaries.
 *
 * @example
 * ```typescript
 * const containerClamped = clampToContainer(dragTransform, nodeRect, containerRect);
 * ```
 */
export function clampToContainer(
  transform: DragTransform2D,
  activeNodeRect: DragNodeRect,
  containerRect: { top: number; left: number; right: number; bottom: number },
): DragTransform2D {
  return clampCoordinateToBounds(transform, activeNodeRect, {
    left: containerRect.left,
    top: containerRect.top,
    right: containerRect.right,
    bottom: containerRect.bottom,
  });
}

/**
 * Calculates normalized proximity ratio (0.0 to 1.0) of a position between boundary bounds.
 * Useful for calculating auto-scroll acceleration or edge glow effects.
 *
 * @param currentPos - Current position coordinate.
 * @param minBound - Lower boundary coordinate.
 * @param maxBound - Upper boundary coordinate.
 * @returns Normalized scalar ratio in [0, 1].
 *
 * @example
 * ```typescript
 * const proximity = boundaryProximity(pointerX, 0, window.innerWidth);
 * ```
 */
export function boundaryProximity(
  currentPos: number,
  minBound: number,
  maxBound: number,
): number {
  return normalizeRatio(currentPos, minBound, maxBound);
}

