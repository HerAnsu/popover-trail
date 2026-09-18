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

/**
 * Computes a 32-bit integer hash from geometric layout coordinates and zIndex.
 * Utilizes multiplicative Murmur-style bit mixing (`Math.imul` and XOR shifts)
 * to produce uniform hash distributions with zero heap allocations on hot interaction paths.
 *
 * @param top - Vertical layout position in pixels.
 * @param left - Horizontal layout position in pixels.
 * @param tx - Computed X translation in pixels.
 * @param ty - Computed Y translation in pixels.
 * @param zIndex - Visual stacking order index.
 * @returns 32-bit integer hash suitable for LRU cache lookup keys.
 *
 * @example
 * ```typescript
 * const key = hashTransformCoordinates(120, 350, 0, 0, 100);
 * const cachedStyle = styleCache.get(key);
 * ```
 */
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
 * Ensures a custom CSS variable name carries the canonical `--pt-` prefix.
 *
 * @param name - Base variable name or raw CSS custom property.
 * @returns Normalized CSS variable name with `--pt-` prefix.
 *
 * @example
 * ```typescript
 * buildPopoverCssVar('drag-x'); // => '--pt-drag-x'
 * buildPopoverCssVar('--pt-drag-x'); // => '--pt-drag-x'
 * ```
 */
export function buildPopoverCssVar(name: string): string {
  return ensurePrefix(name, '--pt-');
}

/**
 * Constructs a hardware-accelerated CSS `transform` string.
 * Optimizes static translations to `translate3d(x, y, 0px)`
 * and adds 3D perspective projection and Euler axis rotations (`rotateX`, `rotateY`, `rotateZ`)
 * only when tilt or rotation dynamics are active.
 *
 * @param translateX - Translation along the X axis in pixels.
 * @param translateY - Translation along the Y axis in pixels.
 * @param rotX - 3D rotation around the X axis in degrees (pitch).
 * @param rotY - 3D rotation around the Y axis in degrees (yaw).
 * @param rotZ - 2D planar rotation around the Z axis in degrees (roll).
 * @returns Hardware-accelerated CSS transform string.
 *
 * @example
 * ```typescript
 * buildTransformString(150, 40, 0, 0, 0);
 * // => 'translate3d(150px, 40px, 0px)'
 *
 * buildTransformString(150, 40, 5, 2, -3);
 * // => 'perspective(1000px) translate3d(150px, 40px, 0px) rotateX(5.00deg) rotateY(2.00deg) rotateZ(-3.00deg)'
 * ```
 */
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
