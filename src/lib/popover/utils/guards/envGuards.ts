/**
 * Environment and Browser Runtime Type Guards.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/envGuards
 */

/**
 * Returns true if executing in a browser environment with `window` defined.
 *
 * @returns True in client-side browser runtimes.
 *
 * @example
 * ```typescript
 * if (isBrowser()) {
 *   window.addEventListener('resize', handleResize);
 * }
 * ```
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Returns true if executing in a server/Node.js environment where `window` is undefined.
 *
 * @returns True during server-side rendering or node test execution.
 *
 * @example
 * ```typescript
 * if (isServer()) {
 *   return initialStaticHtml;
 * }
 * ```
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Returns true if executing in a DOM environment with `document` defined.
 *
 * @returns True if global `document` is available.
 *
 * @example
 * ```typescript
 * if (isDOM()) {
 *   document.getElementById('root');
 * }
 * ```
 */
export function isDOM(): boolean {
  return typeof document !== 'undefined';
}

/**
 * Returns true if running on a device that supports primary touch input.
 *
 * @returns True if touch events or maxTouchPoints are present.
 *
 * @example
 * ```typescript
 * const interactionMode = isTouchDevice() ? 'tap' : 'hover';
 * ```
 */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)
  );
}

/**
 * Returns true if the user's OS or browser preference has reduced motion enabled.
 *
 * @returns True if `prefers-reduced-motion: reduce` query matches.
 *
 * @example
 * ```typescript
 * const duration = prefersReducedMotion() ? 0 : 250;
 * ```
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Returns true if the browser environment supports the BroadcastChannel API.
 *
 * @returns True if BroadcastChannel constructor is supported.
 */
export function isBroadcastChannelSupported(): boolean {
  return isBrowser() && typeof BroadcastChannel !== 'undefined';
}

/**
 * Returns true if the browser environment supports ResizeObserver.
 *
 * @returns True if ResizeObserver constructor is supported.
 */
export function isResizeObserverSupported(): boolean {
  return isBrowser() && typeof ResizeObserver !== 'undefined';
}

/**
 * Returns true if the browser environment supports MutationObserver.
 *
 * @returns True if MutationObserver constructor is supported.
 */
export function isMutationObserverSupported(): boolean {
  return isBrowser() && typeof MutationObserver !== 'undefined';
}

/**
 * Returns true if the browser environment supports IntersectionObserver.
 *
 * @returns True if IntersectionObserver constructor is supported.
 */
export function isIntersectionObserverSupported(): boolean {
  return isBrowser() && typeof IntersectionObserver !== 'undefined';
}

/**
 * Returns true if requestAnimationFrame and cancelAnimationFrame are supported.
 *
 * @returns True if requestAnimationFrame function is present.
 */
export function isAnimationFrameSupported(): boolean {
  return isBrowser() && typeof requestAnimationFrame === 'function';
}
