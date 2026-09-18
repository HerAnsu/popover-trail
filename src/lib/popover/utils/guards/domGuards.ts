/**
 * DOM Element & Node Type Guards.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/domGuards
 */

import { isDOM, isBrowser } from './envGuards';
import { isFunction } from './stringGuards';

export * from './focusGuards';

/** Type guard verifying if an unknown value is an HTMLElement instance. */
export function isHTMLElement(val: unknown): val is HTMLElement {
  return isDOM() && val instanceof HTMLElement;
}

/** Type guard verifying if an unknown value is a DOM Element instance. */
export function isElement(val: unknown): val is Element {
  return isDOM() && val instanceof Element;
}

/** Type guard verifying if an unknown value satisfies an Element-like contract (DOM or test mock). */
export function isElementLike(val: unknown): val is Element {
  return (
    isElement(val) ||
    (typeof val === 'object' &&
      val !== null &&
      'nodeType' in val &&
      val.nodeType === 1 &&
      'hasAttribute' in val &&
      typeof val.hasAttribute === 'function')
  );
}

/** Type guard verifying if an unknown value is a native MessageEvent. */
export function isMessageEvent(val: unknown): val is MessageEvent {
  return typeof MessageEvent !== 'undefined' && val instanceof MessageEvent;
}

/** Safely escapes a CSS identifier for query selectors. */
export function escapeCssIdentifier(ident: string): string {
  if (typeof CSS !== 'undefined' && isFunction(CSS.escape)) {
    return CSS.escape(ident);
  }
  return ident.replace(/(["\\])/g, '\\$1');
}

/** Determines whether a DOM element is an interactive text editing control. */
export function isTextEditableElement(el: unknown): el is HTMLElement {
  if (!isHTMLElement(el)) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || Boolean(el.isContentEditable);
}

/** Determines whether an element is a clickable button or anchor link. */
export function isClickableElement(el: unknown): el is HTMLElement {
  if (!isHTMLElement(el)) return false;
  return el.tagName === 'BUTTON' || el.tagName === 'A';
}

/** Checks whether the given Storage engine is accessible without throwing. */
export function isStorageAvailable(type: 'localStorage' | 'sessionStorage'): boolean {
  if (!isBrowser()) return false;
  try {
    const storage = window[type];
    const testKey = '__popover_storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
