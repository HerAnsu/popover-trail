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

export { hashTransformCoordinates, toFiniteNumber };

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
  const top = Math.round(toFiniteNumber(finalLayoutPos?.top));
  const left = Math.round(toFiniteNumber(finalLayoutPos?.left));
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
  const translateX = isDynamic ? Math.round(rawX * 100) / 100 : Math.round(rawX);
  const translateY = isDynamic ? Math.round(rawY * 100) / 100 : Math.round(rawY);

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
    '--popover-rotate-x': `${rotationX}deg`,
    '--popover-rotate-y': `${rotationY}deg`,
    '--popover-rotate-z': `${rotation}deg`,
    '--popover-z-index': `${safeZ}`,
    '--pt-top': `${top}px`,
    '--pt-left': `${left}px`,
    '--pt-z-index': `${safeZ}`,
    '--pt-drag-x': `${translateX}px`,
    '--pt-drag-y': `${translateY}px`,
    '--pt-tilt-deg': `${rotation}deg`,
  };

  if (!isDynamic) styleCache.set(cacheKey, computedStyle);
  return computedStyle;
}
