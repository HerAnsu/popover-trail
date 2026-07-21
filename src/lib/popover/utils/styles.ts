import type { CSSProperties } from 'react';

/**
 * Parameters for the popover style generation helper.
 */
interface GetPopoverStylesParams {
  /** Viewport relative absolute base layout position returned by Floating UI. */
  readonly finalLayoutPos: { readonly top: number; readonly left: number };
  /** Retained cumulative coordinate drag offset stored inside the Zustand state. */
  readonly offset?: { readonly x: number; readonly y: number };
  /** Temporary, immediate drag translation coordinates from active drag actions. */
  readonly dragX?: number;
  /** Temporary, immediate drag translation coordinates from active drag actions. */
  readonly dragY?: number;
  /** Physics-based spring rotation angle in degrees (rotateZ). */
  readonly rotation?: number;
  /** Physics-based spring 3D tilt rotation around the horizontal X-axis (rotateX). */
  readonly rotationX?: number;
  /** Physics-based spring 3D tilt rotation around the vertical Y-axis (rotateY). */
  readonly rotationY?: number;
  /** Layer depth index to stack topmost/pinned items. */
  readonly zIndex?: number;
}

const styleMemoCache = new Map<string, CSSProperties>();
const MAX_MEMO_CACHE_SIZE = 128;

/**
 * Computes the absolute layout coordinates, drag-and-drop translations,
 * and rotation physics angles into a single React CSSProperties style object.
 *
 * @remarks
 * Coordinates are rounded to the nearest pixel (`Math.round`) to prevent sub-pixel
 * fractional layout coordinates from rendering blurry borders and blurry text.
 * Promotes the element to its own compositor layer using `willChange: "transform"`
 * to ensure hardware-accelerated transformations during fast dragging operations.
 * Uses memoization to preserve referential identity for identical inputs.
 *
 * @param params - The coordinates, offsets, and transformation properties.
 * @returns A CSS properties style object ready to be applied on the outer card element.
 */
export function getPopoverStyles({
  finalLayoutPos,
  offset = { x: 0, y: 0 },
  dragX = 0,
  dragY = 0,
  rotation = 0,
  rotationX = 0,
  rotationY = 0,
  zIndex = 1000,
}: GetPopoverStylesParams): CSSProperties {
  const top = Math.round(finalLayoutPos.top);
  const left = Math.round(finalLayoutPos.left);
  const translateX = Math.round(dragX + offset.x);
  const translateY = Math.round(dragY + offset.y);

  const cacheKey = `${top}_${left}_${translateX}_${translateY}_${rotation}_${rotationX}_${rotationY}_${zIndex}`;
  const cachedStyle = styleMemoCache.get(cacheKey);
  if (cachedStyle) {
    return cachedStyle;
  }

  const computedStyle: CSSProperties = {
    position: 'absolute',
    top,
    left,
    transform: `translate(${translateX}px, ${translateY}px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotation}deg)`,
    willChange: 'transform',
    zIndex,
    // CSS Custom Properties for external style overrides and animations
    ['--popover-translate-x' as string]: `${translateX}px`,
    ['--popover-translate-y' as string]: `${translateY}px`,
    ['--popover-rotate-x' as string]: `${rotationX}deg`,
    ['--popover-rotate-y' as string]: `${rotationY}deg`,
    ['--popover-rotate-z' as string]: `${rotation}deg`,
    ['--popover-z-index' as string]: `${zIndex}`,
  };

  if (styleMemoCache.size >= MAX_MEMO_CACHE_SIZE) {
    const firstKey = styleMemoCache.keys().next().value;
    if (firstKey) styleMemoCache.delete(firstKey);
  }
  styleMemoCache.set(cacheKey, computedStyle);

  return computedStyle;
}
