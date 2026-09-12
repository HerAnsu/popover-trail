/**
 * Click-Outside Target and Event Path Helpers.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/clickOutsideHelpers
 */

import { isPortalOrExcludedTarget, getEventPath, getEventTarget } from '../utils/domEvents';
import { TriggerRegistry } from '../utils/triggerRegistry';
import { isElement, isPointerOrMouseEvent, isContainedInPath } from '../utils/typeGuards';

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

export function shouldIgnoreEvent(
  e: Event,
  ignoreFn?: (e: PointerEvent | MouseEvent) => boolean,
): boolean {
  if (isPortalOrExcludedTarget(e)) return true;
  if (ignoreFn && isPointerOrMouseEvent(e) && ignoreFn(e)) return true;
  return false;
}

export function isClickInsidePopoverOrAnchor(
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
