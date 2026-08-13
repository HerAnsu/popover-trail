/**
 * Returns the event propagation path, supporting Shadow DOM composedPath.
 */
export function getEventPath(e: Event): EventTarget[] {
  if (typeof e.composedPath === 'function') {
    return e.composedPath();
  }
  return e.target ? [e.target] : [];
}

/**
 * Safely extracts the event target or primary Shadow DOM origin node from an event.
 */
export function getEventTarget<T extends EventTarget = HTMLElement>(e: Event): T | null {
  if (typeof e.composedPath === 'function') {
    const path = e.composedPath();
    if (path.length > 0) return (path[0] as T) ?? (e.target as T | null);
  }
  return (e.target as T | null) ?? null;
}

/**
 * Inspects event path for elements marked with data-popover-portal or data-popover-ignore-outside.
 */
export function isPortalOrExcludedTarget(e: Event): boolean {
  const path = getEventPath(e);
  for (const target of path) {
    if (target instanceof Element) {
      if (
        target.hasAttribute('data-popover-portal') ||
        target.hasAttribute('data-popover-ignore-outside')
      ) {
        return true;
      }
    }
  }
  return false;
}
