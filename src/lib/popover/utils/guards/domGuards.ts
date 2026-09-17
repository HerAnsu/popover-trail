/**
 * DOM Element & Node Type Guards.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/domGuards
 */

import { isDOM, isBrowser } from './envGuards';
import { isFunction } from './stringGuards';

export * from './focusGuards';

/**
 * Type guard verifying if an unknown value is an HTMLElement instance.
 *
 * @param val - Candidate value to evaluate.
 * @returns True if `val` is an `HTMLElement` in the active browser DOM.
 *
 * @example
 * ```typescript
 * if (isHTMLElement(target)) {
 *   target.focus();
 * }
 * ```
 */
export function isHTMLElement(val: unknown): val is HTMLElement {
  return isDOM() && val instanceof HTMLElement;
}

/**
 * Type guard verifying if an unknown value is a DOM Element instance.
 *
 * @param val - Candidate value to evaluate.
 * @returns True if `val` is a DOM `Element`.
 *
 * @example
 * ```typescript
 * if (isElement(node)) {
 *   console.log(node.tagName);
 * }
 * ```
 */
export function isElement(val: unknown): val is Element {
  return isDOM() && val instanceof Element;
}

/**
 * Type guard verifying if an unknown value satisfies an Element-like contract (DOM or test mock).
 *
 * @param val - Candidate value to evaluate.
 * @returns True if `val` conforms to the `Element` duck-typed interface.
 *
 * @example
 * ```typescript
 * if (isElementLike(target)) {
 *   target.hasAttribute('data-popover-card');
 * }
 * ```
 */
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

/**
 * Type guard verifying if an unknown value is a native MessageEvent.
 *
 * @param val - Candidate event to evaluate.
 * @returns True if `val` is an instance of `MessageEvent`.
 *
 * @example
 * ```typescript
 * if (isMessageEvent(evt)) {
 *   console.log(evt.data);
 * }
 * ```
 */
export function isMessageEvent(val: unknown): val is MessageEvent {
  return typeof MessageEvent !== 'undefined' && val instanceof MessageEvent;
}

/**
 * Safely escapes a CSS identifier for query selectors.
 *
 * @param ident - Raw identifier string to escape.
 * @returns Escaped CSS identifier suitable for querySelector.
 *
 * @example
 * ```typescript
 * escapeCssIdentifier('card:1'); // => 'card\\:1'
 * ```
 */
export function escapeCssIdentifier(ident: string): string {
  if (typeof CSS !== 'undefined' && isFunction(CSS.escape)) {
    return CSS.escape(ident);
  }
  return ident.replace(/(["\\])/g, '\\$1');
}

/**
 * Determines whether a given DOM element is an interactive text editing control.
 *
 * @param el - Candidate element to inspect.
 * @returns True if `el` is an `<input>`, `<textarea>`, or contenteditable element.
 *
 * @example
 * ```typescript
 * if (isTextEditableElement(document.activeElement)) {
 *   // Prevent shortcut dismissal while user is typing
 * }
 * ```
 */
export function isTextEditableElement(el: unknown): el is HTMLElement {
  if (!isHTMLElement(el)) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || Boolean(el.isContentEditable);
}

/**
 * Determines whether a given element is a clickable button or anchor link.
 *
 * @param el - Candidate element to inspect.
 * @returns True if `el` is a `<button>` or `<a>` element.
 *
 * @example
 * ```typescript
 * if (isClickableElement(target)) {
 *   // Element handles click natively
 * }
 * ```
 */
export function isClickableElement(el: unknown): el is HTMLElement {
  if (!isHTMLElement(el)) return false;
  return el.tagName === 'BUTTON' || el.tagName === 'A';
}

/**
 * Checks whether the given Storage engine is accessible without throwing.
 *
 * @param type - Storage engine name ('localStorage' or 'sessionStorage').
 * @returns True if storage is supported and writable.
 *
 * @example
 * ```typescript
 * if (isStorageAvailable('localStorage')) {
 *   localStorage.setItem('key', 'val');
 * }
 * ```
 */
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
