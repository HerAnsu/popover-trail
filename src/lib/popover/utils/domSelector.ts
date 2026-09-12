/**
 * Memoized CSS Selector Escaping Engine for Popover DOM Lookups.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/domSelector
 */

const selectorEscapeCache = new Map<string, string>();

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
