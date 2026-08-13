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

const styleMemoCache = new Map<number, CSSProperties>();
const MAX_MEMO_CACHE_SIZE = 128;
const DEFAULT_FALLBACK_Z_INDEX = 1000;
const DEFAULT_PERSPECTIVE_PX = 1000;

/**
 * Computes a 32-bit integer hash from numeric style coordinates.
 * Uses multiplicative hashing with XOR to spread values across the integer space.
 * Collision probability is negligible for typical popover position ranges.
 */
function hashStyleKey(top: number, left: number, tx: number, ty: number, zIndex: number): number {
  let h =
    Math.imul(Math.round(top), 73856093) ^
    Math.imul(Math.round(left), 19349663) ^
    Math.imul(Math.round(tx), 83492791) ^
    Math.imul(Math.round(ty), 4256233) ^
    Math.imul(zIndex, 38865001);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  return h ^ (h >>> 16);
}

/**
 * Safely converts an unknown value to a finite number with an optional fallback (default: 0).
 */
export function toFiniteNumber(val: unknown, fallback = 0): number {
  return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
}

/** Single source of truth frozen zero offset constant for style generation */
const DEFAULT_ZERO_OFFSET: Readonly<{ x: number; y: number }> = Object.freeze({
  x: 0,
  y: 0,
});

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
  offset = DEFAULT_ZERO_OFFSET,
  dragX = 0,
  dragY = 0,
  rotation = 0,
  rotationX = 0,
  rotationY = 0,
  zIndex = DEFAULT_FALLBACK_Z_INDEX,
}: GetPopoverStylesParams): CSSProperties {
  const safeTopPos = toFiniteNumber(finalLayoutPos?.top);
  const safeLeftPos = toFiniteNumber(finalLayoutPos?.left);
  const safeDragX = toFiniteNumber(dragX);
  const safeDragY = toFiniteNumber(dragY);
  const safeOffsetX = toFiniteNumber(offset?.x);
  const safeOffsetY = toFiniteNumber(offset?.y);
  const safeRotation = toFiniteNumber(rotation);
  const safeRotationX = toFiniteNumber(rotationX);
  const safeRotationY = toFiniteNumber(rotationY);
  const safeZIndex = toFiniteNumber(zIndex, DEFAULT_FALLBACK_Z_INDEX);

  const top = Math.round(safeTopPos);
  const left = Math.round(safeLeftPos);

  const isDynamic =
    safeDragX !== 0 ||
    safeDragY !== 0 ||
    safeRotation !== 0 ||
    safeRotationX !== 0 ||
    safeRotationY !== 0;

  const translateX = isDynamic
    ? Math.round((safeDragX + safeOffsetX) * 100) / 100
    : Math.round(safeDragX + safeOffsetX);
  const translateY = isDynamic
    ? Math.round((safeDragY + safeOffsetY) * 100) / 100
    : Math.round(safeDragY + safeOffsetY);

  const cacheKey = isDynamic ? 0 : hashStyleKey(top, left, translateX, translateY, safeZIndex);

  if (!isDynamic) {
    const cachedStyle = styleMemoCache.get(cacheKey);
    if (cachedStyle) {
      return cachedStyle;
    }
  }

  const hasRotation = safeRotation !== 0 || safeRotationX !== 0 || safeRotationY !== 0;
  const transformStr = hasRotation
    ? `perspective(${DEFAULT_PERSPECTIVE_PX}px) translate3d(${translateX}px, ${translateY}px, 0px) rotateX(${safeRotationX.toFixed(2)}deg) rotateY(${safeRotationY.toFixed(2)}deg) rotateZ(${safeRotation.toFixed(2)}deg)`
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
