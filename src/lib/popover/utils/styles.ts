/**
 * Hardware-Accelerated Dynamic Style Generator with LRU Caching.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/styles
 */

import type { CSSProperties } from 'react';
import type { ZIndexDepth } from '../types/branded';
import { createLRUCache } from './lruCache';
import { hashTransformCoordinates, toFiniteNumber, buildTransformString } from './stylesTransform';
import { DEFAULT_BASE_Z_INDEX, ZERO_OFFSET } from '../constants';
import { roundTo } from './math';
import { compose, pipe } from './functional';

export { hashTransformCoordinates, toFiniteNumber };

const roundCoordinate = compose(Math.round, toFiniteNumber);

export interface GetPopoverStylesParams {
  readonly finalLayoutPos: { readonly top: number; readonly left: number };
  readonly offset?: { readonly x: number; readonly y: number };
  readonly dragX?: number;
  readonly dragY?: number;
  readonly rotation?: number;
  readonly rotationX?: number;
  readonly rotationY?: number;
  readonly zIndex?: ZIndexDepth | number;
}

const styleCache = createLRUCache<number, CSSProperties>(128);
const DEFAULT_FALLBACK_Z_INDEX = DEFAULT_BASE_Z_INDEX;

/**
 * Computes hardware-accelerated CSS properties and `--pt-*` custom variables for a popover card.
 * Normalizes input coordinates to finite numbers, applies subpixel rounding during dynamic dragging,
 * and caches static layout positions via an internal LRU cache to eliminate style object re-allocation.
 *
 * @param params - Layout coordinates, drag deltas, 3D tilt rotations, and stacking z-index.
 * @returns React `CSSProperties` object with absolute positioning, transform, and custom properties.
 *
 * @example
 * ```typescript
 * const cardStyle = getPopoverStyles({
 *   finalLayoutPos: { top: 120, left: 340 },
 *   offset: { x: 10, y: 0 },
 *   dragX: 5,
 *   dragY: 0,
 *   rotation: 2,
 *   zIndex: 105,
 * });
 * ```
 */
export function getPopoverStyles({
  finalLayoutPos,
  offset = ZERO_OFFSET,

  dragX = 0,
  dragY = 0,
  rotation = 0,
  rotationX = 0,
  rotationY = 0,
  zIndex = DEFAULT_FALLBACK_Z_INDEX,
}: GetPopoverStylesParams): CSSProperties {
  const top = roundCoordinate(finalLayoutPos?.top);
  const left = roundCoordinate(finalLayoutPos?.left);
  const safeDragX = toFiniteNumber(dragX);
  const safeDragY = toFiniteNumber(dragY);
  const safeOffsetX = toFiniteNumber(offset?.x);
  const safeOffsetY = toFiniteNumber(offset?.y);
  const safeRot = toFiniteNumber(rotation);
  const safeRotX = toFiniteNumber(rotationX);
  const safeRotY = toFiniteNumber(rotationY);
  const safeZ = toFiniteNumber(zIndex, DEFAULT_FALLBACK_Z_INDEX);

  const isDynamic =
    safeDragX !== 0 || safeDragY !== 0 || safeRot !== 0 || safeRotX !== 0 || safeRotY !== 0;
  const rawX = safeDragX + safeOffsetX;
  const rawY = safeDragY + safeOffsetY;
  const translateX = isDynamic ? roundTo(rawX, 2) : pipe(rawX, Math.round);
  const translateY = isDynamic ? roundTo(rawY, 2) : pipe(rawY, Math.round);

  const cacheKey = isDynamic
    ? 0
    : hashTransformCoordinates(top, left, translateX, translateY, safeZ);
  if (!isDynamic) {
    const cached = styleCache.get(cacheKey);
    if (cached) return cached;
  }

  const computedStyle: CSSProperties & Record<`--${string}`, string | number> = {
    position: 'absolute',
    top,
    left,
    transform: buildTransformString(translateX, translateY, safeRotX, safeRotY, safeRot),
    backfaceVisibility: 'hidden',
    willChange: isDynamic ? 'transform' : 'auto',
    zIndex: safeZ,
    '--popover-translate-x': `${translateX}px`,
    '--popover-translate-y': `${translateY}px`,
    '--popover-rotate-x': `${safeRotX}deg`,
    '--popover-rotate-y': `${safeRotY}deg`,
    '--popover-rotate-z': `${safeRot}deg`,
    '--popover-z-index': `${safeZ}`,
    '--pt-top': `${top}px`,
    '--pt-left': `${left}px`,
    '--pt-z-index': `${safeZ}`,
    '--pt-drag-x': `${translateX}px`,
    '--pt-drag-y': `${translateY}px`,
    '--pt-tilt-deg': `${safeRot}deg`,
  };

  if (!isDynamic) styleCache.set(cacheKey, computedStyle);
  return computedStyle;
}
