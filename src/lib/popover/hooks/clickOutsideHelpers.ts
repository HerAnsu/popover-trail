/**
 * Click-Outside Target and Event Path Helpers.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/clickOutsideHelpers
 */

import { isPortalOrExcludedTarget, getEventPath, getEventTarget } from '../utils/domEvents';
import { TriggerRegistry } from '../utils/triggerRegistry';
import { isElement, isPointerOrMouseEvent, isContainedInPath } from '../utils/typeGuards';

/**
 * Checks whether an element is located inside a popover card, dialog, or ignored element.
 *
 * @param el - DOM element to check.
 * @param selector - Custom CSS selector representing popovers.
 * @param ignoreClass - Optional class name indicating an element should be ignored from outside clicks.
 * @returns True if `el` or any ancestor matches the popover or ignore criteria.
 *
 * @example
 * ```typescript
 * if (isInsidePopover(eventTarget, '.popover-card', 'ignore-dismiss')) {
 *   // Event originated inside the popover or an explicit ignore zone
 * }
 * ```
 */
export function isInsidePopover(el: Element, selector: string, ignoreClass?: string): boolean {
  try {
    if (el.closest(selector) || el.closest('.popover-card,[data-key],[role="dialog"]')) return true;
    if (ignoreClass && (el.classList.contains(ignoreClass) || el.closest(`.${ignoreClass}`))) {
      return true;
    }
  } catch {
    // Ignore DOM query parsing exceptions
  }
  return false;
}

/**
 * Determines if a pointer or mouse event should be ignored from triggering click-outside teardowns.
 *
 * Checks if the event target is inside a portal container, an excluded boundary,
 * or matched by an optional user-defined filter function.
 *
 * @param e - Triggering DOM event.
 * @param ignoreFn - Optional consumer callback to suppress outside-click handling.
 * @returns True if the event should be ignored.
 *
 * @example
 * ```typescript
 * if (shouldIgnoreEvent(event, (e) => (e.target as Element)?.classList.contains('do-not-close'))) {
 *   return;
 * }
 * ```
 */
export function shouldIgnoreEvent(
  e: Event,
  ignoreFn?: (e: PointerEvent | MouseEvent) => boolean,
): boolean {
  if (isPortalOrExcludedTarget(e)) return true;
  if (ignoreFn && isPointerOrMouseEvent(e) && ignoreFn(e)) return true;
  return false;
}

/**
 * Checks if an event occurred inside any active popover card, its trigger anchor, or an ignored element.
 *
 * Traverses the event propagation path to ensure clicks on nested triggers,
 * custom portals, or anchor buttons are not mistakenly treated as outside clicks.
 *
 * @param e - Triggering DOM event.
 * @param selector - Popover CSS selector.
 * @param ignoreClass - Optional CSS class to ignore.
 * @param ownerId - Popover key identifier to look up registered trigger elements.
 * @param anchorElement - Explicit trigger anchor DOM element fallback.
 * @returns True if the click is inside a popover or its associated trigger anchor.
 *
 * @example
 * ```typescript
 * if (isInsidePopoverOrAnchor(event, '.popover-card', undefined, 'card-1', anchorEl)) {
 *   // Click was inside the popover or its anchor
 *   return;
 * }
 * ```
 */
export function isInsidePopoverOrAnchor(
  e: Event,
  selector: string,
  ignoreClass: string | undefined,
  ownerId: string | null | undefined,
  anchorElement: Element | null | undefined,
): boolean {
  const path = getEventPath(e);
  const target = getEventTarget(e, isElement);

  for (const item of path) {
    if (isElement(item) && isInsidePopover(item, selector, ignoreClass)) return true;
  }

  const anchorEl = TriggerRegistry.get(ownerId ?? '') ?? anchorElement;
  return isContainedInPath(path, target, anchorEl);
}
