/**
 * Memoized CSS Selector Escaping Engine for Popover DOM Lookups.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/domSelector
 */

const selectorEscapeCache = new Map<string, string>();

/**
 * Returns a CSS-escaped selector string, caching results in a bounded LRU-like Map.
 * Uses native `CSS.escape` when available.
 *
 * @param val - Value to escape for use in CSS selectors.
 * @returns Escaped selector string.
 *
 * @example
 * ```typescript
 * const selector = getMemoizedEscapedSelector('user:123/special');
 * const element = document.querySelector(`[data-key="${selector}"]`);
 * ```
 */
export function getMemoizedEscapedSelector(val: string): string {
  let escaped = selectorEscapeCache.get(val);
  if (escaped === undefined) {
    escaped =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(val) : val;
    if (selectorEscapeCache.size > 200) selectorEscapeCache.clear();
    selectorEscapeCache.set(val, escaped);
  }
  return escaped;
}
