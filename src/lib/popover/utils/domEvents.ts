import { isElementLike, isFunction } from './typeGuards';
import { DATA_POPOVER_PORTAL, DATA_POPOVER_IGNORE_OUTSIDE } from '../constants';

/**
 * Returns the event propagation path array, with support for Shadow DOM `composedPath()`.
 *
 * @param e - DOM Event instance.
 * @returns Array of EventTarget nodes traversed during event propagation.
 */
export function getEventPath(e: Event): EventTarget[] {
  if (isFunction(e.composedPath)) {
    return e.composedPath();
  }
  return e.target ? [e.target] : [];
}

/**
 * Safely extracts the event target or primary Shadow DOM origin node from an event.
 *
 * @template T - Expected EventTarget or HTMLElement subclass.
 * @param e - DOM Event instance.
 * @returns Target element or null if unavailable.
 */
export function getEventTarget<T extends EventTarget = HTMLElement>(
  e: Event,
  guard?: (node: EventTarget) => node is T,
): T | null {
  const path = isFunction(e.composedPath) ? e.composedPath() : null;
  const candidate = path && path.length > 0 ? (path[0] ?? e.target) : e.target;
  if (!candidate) return null;
  if (guard) {
    return guard(candidate) ? candidate : null;
  }
  return candidate as T;
}

/**
 * Inspects the event propagation path for elements explicitly marked with
 * `data-popover-portal` or `data-popover-ignore-outside` attributes.
 *
 * @param e - DOM Event instance.
 * @returns True if any ancestor in the event path is marked to be ignored.
 */
export function isPortalOrExcludedTarget(e: Event): boolean {
  const path = getEventPath(e);
  for (const target of path) {
    if (
      isElementLike(target) &&
      (target.hasAttribute(DATA_POPOVER_PORTAL) || target.hasAttribute(DATA_POPOVER_IGNORE_OUTSIDE))
    ) {
      return true;
    }
  }
  return false;
}
