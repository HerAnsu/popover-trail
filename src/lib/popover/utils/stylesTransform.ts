/**
 * Transform String and Multiplicative Coordinate Hashing for Styles.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/stylesTransform
 */

import { toFiniteNumber } from './math';
import { ensurePrefix } from './stringUtils';

export { toFiniteNumber };

const DEFAULT_PERSPECTIVE_PX = 1000;

export function hashTransformCoordinates(
  top: number,
  left: number,
  tx: number,
  ty: number,
  zIndex: number,
): number {
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
 * Ensures custom CSS variable has canonical --pt- prefix.
 */
export function buildPopoverCssVar(name: string): string {
  return ensurePrefix(name, '--pt-');
}

export function buildTransformString(
  translateX: number,
  translateY: number,
  rotX: number,
  rotY: number,
  rotZ: number,
): string {
  const hasRotation = rotZ !== 0 || rotX !== 0 || rotY !== 0;
  if (!hasRotation) {
    return `translate3d(${translateX}px, ${translateY}px, 0px)`;
  }
  return `perspective(${DEFAULT_PERSPECTIVE_PX}px) translate3d(${translateX}px, ${translateY}px, 0px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg)`;
}
