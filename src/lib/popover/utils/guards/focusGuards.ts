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
 */
export function isFocusableElement(
  el: unknown,
): el is HTMLElement & { focus: (options?: FocusOptions) => void } {
  return typeof HTMLElement !== 'undefined' && el instanceof HTMLElement && isFunction(el.focus);
}

/**
 * Determines whether the active document element is contained within the container,
 * or if focus resides on document.body / unassigned.
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
 */
export function isPointerOrMouseEvent(e: unknown): e is PointerEvent | MouseEvent {
  if (typeof MouseEvent !== 'undefined' && e instanceof MouseEvent) return true;
  if (typeof PointerEvent !== 'undefined' && e instanceof PointerEvent) return true;
  return false;
}

/**
 * Checks whether an event target path or target element is contained within an anchor/container element.
 */
export function isContainedInPath(
  path: readonly EventTarget[],
  target: Element | null,
  container: Element | null | undefined,
): boolean {
  if (!container) return false;
  return path.includes(container) || (target ? container.contains(target) : false);
}
