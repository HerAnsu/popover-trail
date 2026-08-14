/**
 * Returns the event propagation path array, with support for Shadow DOM `composedPath()`.
 *
 * @param e - DOM Event instance.
 * @returns Array of EventTarget nodes traversed during event propagation.
 */
export function getEventPath(e: Event): EventTarget[] {
  if (typeof e.composedPath === 'function') {
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
export function getEventTarget<T extends EventTarget = HTMLElement>(e: Event): T | null {
  if (typeof e.composedPath === 'function') {
    const path = e.composedPath();
    if (path.length > 0) return (path[0] as T) ?? (e.target as T | null);
  }
  return (e.target as T | null) ?? null;
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
      target instanceof Element &&
      (target.hasAttribute('data-popover-portal') ||
        target.hasAttribute('data-popover-ignore-outside'))
    ) {
      return true;
    }
  }
  return false;
}
