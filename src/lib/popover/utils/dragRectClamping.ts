/**
 * Axis-Aligned Rectangle Clamping and Container Bounds Projection.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dragRectClamping
 */

import { isBrowser } from './typeGuards';
import { clamp, normalizeRatio } from './math';
import type { DragTransform2D, DragNodeRect, DragBoundsRect } from './dragBounds';

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

export function clampToWindowBounds(
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

export function clampToContainerBounds(
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
 */
export function computeBoundaryProximityRatio(
  currentPos: number,
  minBound: number,
  maxBound: number,
): number {
  return normalizeRatio(currentPos, minBound, maxBound);
}
