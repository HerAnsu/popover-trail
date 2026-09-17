/**
 * Memoized CSS Selector Escaping Engine for Popover DOM Lookups.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/domSelector
 */

const selectorEscapeCache = new Map<string, string>();

/**
 * Escapes a string value for safe use within CSS selectors.
 *
 * Caches results in an internal bounded Map to avoid repetitive `CSS.escape` overhead.
 * Falls back to the raw string if `CSS.escape` is unavailable in the environment (e.g. SSR).
 *
 * @param val - Value to escape for use in CSS selectors.
 * @returns Escaped selector string.
 *
 * @example
 * ```typescript
 * const selector = escapeSelector('user:123/special');
 * const element = document.querySelector(`[data-key="${selector}"]`);
 * ```
 */
export function escapeSelector(val: string): string {
  let escaped = selectorEscapeCache.get(val);
  if (escaped === undefined) {
    escaped =
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(val) : val;
    if (selectorEscapeCache.size > 200) selectorEscapeCache.clear();
    selectorEscapeCache.set(val, escaped);
  }
  return escaped;
}
