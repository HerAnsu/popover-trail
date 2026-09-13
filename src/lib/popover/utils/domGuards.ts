/**
 * Pure DOM Event and Element Guards for Boundary Isolation.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/domGuards
 */

import { isElementLike } from './typeGuards';
import { getEventPath } from './domEvents';
import { getMemoizedEscapedSelector } from './domSelector';
import { first, last } from './arrayUtils';
import { DATA_POPOVER_PORTAL, DATA_POPOVER_IGNORE_OUTSIDE } from '../constants';

export { getMemoizedEscapedSelector };

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

export function isClickOnIgnoredTrigger(e: Event, triggerElement?: HTMLElement | null): boolean {
  if (!triggerElement) return false;
  const path = getEventPath(e);
  for (const target of path) {
    if (target === triggerElement) return true;
    if (isElementLike(target) && target.hasAttribute(DATA_POPOVER_IGNORE_OUTSIDE)) return true;
  }
  return false;
}

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

export function stopEventPropagation(e: unknown): void {
  if (isStopPropagationLike(e)) {
    e.stopPropagation();
  }
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function findNextFocusable(container: HTMLElement, reverse = false): HTMLElement | null {
  const elements = [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (el) => el.offsetParent !== null && !el.hasAttribute('disabled'),
  );
  if (elements.length === 0) return null;
  return reverse ? (last(elements) ?? null) : (first(elements) ?? null);
}
