/**
 * Pure DOM Event and Element Guards for Boundary Isolation.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/domGuards
 */

import { isElementLike } from './typeGuards';
import { getEventPath } from './domEvents';
import { escapeSelector } from './domSelector';
import { first, last } from './arrayUtils';
import { and } from './functional';
import { DATA_POPOVER_PORTAL, DATA_POPOVER_IGNORE_OUTSIDE } from '../constants';

export { escapeSelector };

/**
 * Checks whether a DOM event originated inside a popover portal element.
 *
 * @param e - DOM Event instance.
 * @param portalKey - Optional specific portal key string to match.
 * @returns True if the event occurred inside an active portal.
 *
 * @example
 * ```typescript
 * if (isClickInsidePortal(event, 'portal-main')) {
 *   // Do not dismiss
 * }
 * ```
 */
export function isClickInsidePortal(e: Event, portalKey?: string): boolean {
  const path = getEventPath(e);
  for (const target of path) {
    if (isElementLike(target)) {
      if (portalKey) {
        if (target.getAttribute(DATA_POPOVER_PORTAL) === portalKey) return true;
      } else if (target.hasAttribute(DATA_POPOVER_PORTAL)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Checks whether a click event occurred on the trigger element or on an element marked with `data-popover-ignore-outside`.
 *
 * @param e - DOM Event instance.
 * @param triggerElement - Known trigger element.
 * @returns True if click should be ignored by outside-click dismiss handlers.
 *
 * @example
 * ```typescript
 * if (isClickOnIgnoredTrigger(event, triggerButton)) {
 *   return; // Ignore outside click
 * }
 * ```
 */
export function isClickOnIgnoredTrigger(e: Event, triggerElement?: HTMLElement | null): boolean {
  if (!triggerElement) return false;
  const path = getEventPath(e);
  for (const target of path) {
    if (target === triggerElement) return true;
    if (isElementLike(target) && target.hasAttribute(DATA_POPOVER_IGNORE_OUTSIDE)) return true;
  }
  return false;
}

/**
 * Type guard testing whether a value exposes a valid `getBoundingClientRect()` method.
 *
 * @param val - Candidate value to test.
 * @returns True if value has getBoundingClientRect function.
 *
 * @example
 * ```typescript
 * if (hasBoundingClientRect(target)) {
 *   const rect = target.getBoundingClientRect();
 * }
 * ```
 */
export function hasBoundingClientRect(
  val: unknown,
): val is { getBoundingClientRect: () => DOMRect } {
  return (
    typeof val === 'object' &&
    val !== null &&
    'getBoundingClientRect' in val &&
    typeof val.getBoundingClientRect === 'function'
  );
}

function isStopPropagationLike(e: unknown): e is { stopPropagation: () => void } {
  return (
    typeof e === 'object' &&
    e !== null &&
    'stopPropagation' in e &&
    typeof e.stopPropagation === 'function'
  );
}

/**
 * Safely stops event propagation if the candidate provides a `stopPropagation` method.
 *
 * @param e - Unknown event candidate (safely handles null/undefined).
 *
 * @example
 * ```typescript
 * stopPropagation(event);
 * ```
 */
export function stopPropagation(e: unknown): void {
  if (isStopPropagationLike(e)) {
    e.stopPropagation();
  }
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Finds the first (or last, in reverse mode) keyboard focusable element inside a DOM container.
 *
 * @param container - Root DOM element to query.
 * @param reverse - When true, finds the last focusable element; when false, finds the first.
 * @returns Focusable HTMLElement or null if none exist.
 *
 * @example
 * ```typescript
 * const firstInput = findNextFocusable(cardContainer);
 * firstInput?.focus();
 * ```
 */
export function findNextFocusable(container: HTMLElement, reverse = false): HTMLElement | null {
  const isFocusableElement = and(
    (el: HTMLElement) => el.offsetParent !== null,
    (el: HTMLElement) => !el.hasAttribute('disabled'),
  );
  const elements = [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    isFocusableElement,
  );
  if (elements.length === 0) return null;
  return reverse ? (last(elements) ?? null) : (first(elements) ?? null);
}
