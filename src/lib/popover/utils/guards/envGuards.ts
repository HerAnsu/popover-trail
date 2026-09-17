/**
 * Environment and Browser Runtime Type Guards.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/envGuards
 */

/** Returns true if executing in a browser environment with `window` defined. */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/** Returns true if executing in a server/Node.js environment where `window` is undefined. */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/** Returns true if executing in a DOM environment with `document` defined. */
export function isDOM(): boolean {
  return typeof document !== 'undefined';
}

/** Returns true if running on a device that supports primary touch input. */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
  );
}

/** Returns true if the user's OS or browser preference has reduced motion enabled. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Returns true if the browser environment supports the BroadcastChannel API. */
export function isBroadcastChannelSupported(): boolean {
  return isBrowser() && typeof BroadcastChannel !== 'undefined';
}

/** Returns true if the browser environment supports ResizeObserver. */
export function isResizeObserverSupported(): boolean {
  return isBrowser() && typeof ResizeObserver !== 'undefined';
}

/** Returns true if the browser environment supports MutationObserver. */
export function isMutationObserverSupported(): boolean {
  return isBrowser() && typeof MutationObserver !== 'undefined';
}

/** Returns true if the browser environment supports IntersectionObserver. */
export function isIntersectionObserverSupported(): boolean {
  return isBrowser() && typeof IntersectionObserver !== 'undefined';
}

/** Returns true if requestAnimationFrame and cancelAnimationFrame are supported. */
export function isAnimationFrameSupported(): boolean {
  return isBrowser() && typeof requestAnimationFrame === 'function';
}
