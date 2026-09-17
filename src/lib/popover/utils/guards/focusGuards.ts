/**
 * DOM Focus, Traversal & Pointer Event Type Guards.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/focusGuards
 */

import { isDOM } from './envGuards';
import { isFunction } from './stringGuards';

/**
 * Returns the currently active document element if it is an HTMLElement.
 *
 * @returns Currently focused HTMLElement or null if none or non-HTML.
 *
 * @example
 * ```typescript
 * const focused = getActiveHTMLElement();
 * if (focused) {
 *   console.log(focused.tagName);
 * }
 * ```
 */
export function getActiveHTMLElement(): HTMLElement | null {
  return isDOM() &&
    typeof HTMLElement !== 'undefined' &&
    document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null;
}

/**
 * Checks whether an element is connected to the DOM and has a callable focus method.
 *
 * @param el - Candidate element to inspect.
 * @returns True if `el` is an attached HTMLElement that can receive focus.
 *
 * @example
 * ```typescript
 * if (canElementReceiveFocus(element)) {
 *   element.focus();
 * }
 * ```
 */
export function canElementReceiveFocus(el: unknown): el is HTMLElement {
  return (
    typeof HTMLElement !== 'undefined' &&
    el instanceof HTMLElement &&
    isFunction(el.focus) &&
    isDOM() &&
    document.body?.contains(el) === true
  );
}

/**
 * Type guard verifying if an unknown entity can receive focus.
 *
 * @param el - Candidate element to inspect.
 * @returns True if `el` is an HTMLElement with a callable focus method.
 *
 * @example
 * ```typescript
 * if (isFocusableElement(target)) {
 *   target.focus({ preventScroll: true });
 * }
 * ```
 */
export function isFocusableElement(
  el: unknown,
): el is HTMLElement & { focus: (options?: FocusOptions) => void } {
  return typeof HTMLElement !== 'undefined' && el instanceof HTMLElement && isFunction(el.focus);
}

/**
 * Determines whether the active document element is contained within the container,
 * or if focus resides on document.body / unassigned.
 *
 * @param container - Container element to check containment for.
 * @param activeElement - Optional explicit active element (defaults to document.activeElement).
 * @returns True if focus is inside container or on document body.
 *
 * @example
 * ```typescript
 * const inside = isFocusWithin(popoverCardRef.current);
 * ```
 */
export function isFocusWithin(
  container: Element | null,
  activeElement: Element | null = isDOM() ? document.activeElement : null,
): boolean {
  if (!container || !activeElement) return true;
  return container.contains(activeElement) || (isDOM() && activeElement === document.body);
}

/**
 * Type guard validating whether an event is a MouseEvent or PointerEvent.
 *
 * @param e - Candidate event object.
 * @returns True if `e` is a MouseEvent or PointerEvent.
 *
 * @example
 * ```typescript
 * if (isPointerOrMouseEvent(event)) {
 *   console.log(event.clientX, event.clientY);
 * }
 * ```
 */
export function isPointerOrMouseEvent(e: unknown): e is PointerEvent | MouseEvent {
  if (typeof MouseEvent !== 'undefined' && e instanceof MouseEvent) return true;
  if (typeof PointerEvent !== 'undefined' && e instanceof PointerEvent) return true;
  return false;
}

/**
 * Checks whether an event target path or target element is contained within an anchor/container element.
 *
 * @param path - Event composed path elements.
 * @param target - Event target element.
 * @param container - Reference boundary container element.
 * @returns True if event originated within container.
 *
 * @example
 * ```typescript
 * const isInside = isContainedInPath(event.composedPath(), event.target as Element, cardRef.current);
 * ```
 */
export function isContainedInPath(
  path: readonly EventTarget[],
  target: Element | null,
  container: Element | null | undefined,
): boolean {
  if (!container) return false;
  return path.includes(container) || (target ? container.contains(target) : false);
}
