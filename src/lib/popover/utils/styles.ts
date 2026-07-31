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
  const safeTopPos = Number.isFinite(finalLayoutPos.top) ? finalLayoutPos.top : 0;
  const safeLeftPos = Number.isFinite(finalLayoutPos.left) ? finalLayoutPos.left : 0;
  const safeDragX = typeof dragX === 'number' && Number.isFinite(dragX) ? dragX : 0;
  const safeDragY = typeof dragY === 'number' && Number.isFinite(dragY) ? dragY : 0;
  const safeOffsetX = Number.isFinite(offset?.x) ? offset.x : 0;
  const safeOffsetY = Number.isFinite(offset?.y) ? offset.y : 0;
  const safeRotation = Number.isFinite(rotation) ? rotation : 0;
  const safeRotationX = Number.isFinite(rotationX) ? rotationX : 0;
  const safeRotationY = Number.isFinite(rotationY) ? rotationY : 0;
  const safeZIndex = Number.isFinite(zIndex) ? zIndex : 1000;

  const top = Math.round(safeTopPos);
  const left = Math.round(safeLeftPos);

  const isDynamic =
    safeDragX !== 0 ||
    safeDragY !== 0 ||
    safeRotation !== 0 ||
    safeRotationX !== 0 ||
    safeRotationY !== 0;

  const translateX = isDynamic
    ? Number((safeDragX + safeOffsetX).toFixed(2))
    : Math.round(safeDragX + safeOffsetX);
  const translateY = isDynamic
    ? Number((safeDragY + safeOffsetY).toFixed(2))
    : Math.round(safeDragY + safeOffsetY);

  const cacheKey = isDynamic
    ? ''
    : `${top}_${left}_${translateX}_${translateY}_${safeRotation}_${safeRotationX}_${safeRotationY}_${safeZIndex}`;

  if (!isDynamic) {
    const cachedStyle = styleMemoCache.get(cacheKey);
    if (cachedStyle) {
      return cachedStyle;
    }
  }

  const hasRotation = rotation !== 0 || rotationX !== 0 || rotationY !== 0;
  const transformStr = hasRotation
    ? `perspective(1000px) translate3d(${translateX}px, ${translateY}px, 0px) rotateX(${rotationX.toFixed(2)}deg) rotateY(${rotationY.toFixed(2)}deg) rotateZ(${rotation.toFixed(2)}deg)`
    : `translate3d(${translateX}px, ${translateY}px, 0px)`;

  const computedStyle: CSSProperties & Record<`--${string}`, string | number> = {
    position: 'absolute',
    top,
    left,
    transform: transformStr,
    backfaceVisibility: 'hidden',
    willChange: isDynamic ? 'transform' : 'auto',
    zIndex,
    // CSS Custom Properties for external style overrides and animations
    '--popover-translate-x': `${translateX}px`,
    '--popover-translate-y': `${translateY}px`,
    '--popover-rotate-x': `${rotationX}deg`,
    '--popover-rotate-y': `${rotationY}deg`,
    '--popover-rotate-z': `${rotation}deg`,
    '--popover-z-index': `${zIndex}`,
    // Standard --pt-* namespace CSS custom properties
    '--pt-top': `${top}px`,
    '--pt-left': `${left}px`,
    '--pt-z-index': `${zIndex}`,
    '--pt-drag-x': `${translateX}px`,
    '--pt-drag-y': `${translateY}px`,
    '--pt-tilt-deg': `${rotation}deg`,
  };

  if (!isDynamic) {
    if (styleMemoCache.size >= MAX_MEMO_CACHE_SIZE) {
      const firstKey = styleMemoCache.keys().next().value;
      if (firstKey) styleMemoCache.delete(firstKey);
    }
    styleMemoCache.set(cacheKey, computedStyle);
  }

  return computedStyle;
}
