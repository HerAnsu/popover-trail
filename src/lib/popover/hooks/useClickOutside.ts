import { useEffect, useMemo, useRef } from 'react';
import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore, ClickOutsideConfig } from '../types';
import { isPortalOrExcludedTarget, getEventPath, getEventTarget } from '../utils/domEvents';
import { TriggerRegistry } from '../utils/triggerRegistry';
import { wrapResult, isOk } from '../utils/result';

/**
 * Hook options for click-outside event management.
 */
export interface UseClickOutsideOptions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TActions extends object = object,
> {
  /** Target Zustand store instance. */
  store: StoreApi<PopoverStore<TData, TContext, TPopoverKey, TActions>>;
  /** Configuration flags for click-outside behavior. */
  clickOutside?: ClickOutsideConfig & {
    /** Optional custom predicate to selectively ignore clicks on specific elements. */
    shouldIgnoreClick?: (e: PointerEvent | MouseEvent) => boolean;
  };
}

function escapeCSSClass(className: string | undefined): string | null {
  if (!className) return null;
  return typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
    ? `.${CSS.escape(className)}`
    : `.${className.replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

function isElementMatchingPopover(
  el: Element,
  popoverSelector: string,
  escapedIgnoreClass?: string | null,
  ignoreClass?: string | null,
): boolean {
  const matchResult = wrapResult(() => el.matches(popoverSelector));
  if (isOk(matchResult) && matchResult.data) return true;

  if (escapedIgnoreClass) {
    const ignoreMatchResult = wrapResult(() => el.matches(escapedIgnoreClass));
    if (isOk(ignoreMatchResult) && ignoreMatchResult.data) return true;
    if (ignoreClass && el.classList?.contains(ignoreClass)) return true;
  }

  return false;
}

function isClickInsidePopover(
  path: EventTarget[],
  popoverSelector: string,
  escapedIgnoreClass?: string | null,
  ignoreClass?: string | null,
): boolean {
  return path.some(
    (el) =>
      el instanceof Element &&
      isElementMatchingPopover(el, popoverSelector, escapedIgnoreClass, ignoreClass),
  );
}

function isClickOnAnchor(
  path: EventTarget[],
  target: Element | null,
  anchorEl: Element | null | undefined,
): boolean {
  if (!anchorEl) return false;
  return path.includes(anchorEl) || (target ? anchorEl.contains(target) : false);
}

/**
 * Capture-phase click-outside listener hook for the PopoverProvider.
 * Automatically closes active cascade trails when the user clicks outside any open card or anchor.
 *
 * @remarks
 * Robustly inspects composed event paths, supporting Shadow DOM, SVG elements, portals, and custom ignore selectors.
 *
 * @param options - Store API reference and click-outside configuration settings.
 */
export function useClickOutside<TData = unknown, TContext = unknown>({
  store,
  clickOutside,
}: UseClickOutsideOptions<TData, TContext>): void {
  const enabled = clickOutside?.enabled;
  const ignoreClass = clickOutside?.ignoreClass;
  const popoverSelector = clickOutside?.popoverSelector ?? '.popover-card';
  const shouldIgnoreClick = clickOutside?.shouldIgnoreClick;

  const shouldIgnoreClickRef = useRef(shouldIgnoreClick);
  useEffect(() => {
    shouldIgnoreClickRef.current = shouldIgnoreClick;
  }, [shouldIgnoreClick]);

  const escapedIgnoreClass = useMemo(() => escapeCSSClass(ignoreClass), [ignoreClass]);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (e: Event) => {
      if (isPortalOrExcludedTarget(e)) return;
      if (
        shouldIgnoreClickRef.current &&
        (e instanceof MouseEvent ||
          (typeof PointerEvent !== 'undefined' && e instanceof PointerEvent)) &&
        shouldIgnoreClickRef.current(e)
      ) {
        return;
      }

      const path = getEventPath(e);
      const target = getEventTarget<Element>(e);
      const state = store.getState();

      if (isClickInsidePopover(path, popoverSelector, escapedIgnoreClass, ignoreClass)) {
        return;
      }

      const anchorEl = TriggerRegistry.get(state.ownerId ?? '') ?? state.anchorElement;
      if (isClickOnAnchor(path, target, anchorEl)) {
        return;
      }

      state.clearTrail();
    };

    const eventType =
      typeof window !== 'undefined' && 'PointerEvent' in window ? 'pointerdown' : 'mousedown';

    document.addEventListener(eventType, handleClickOutside, { capture: true });
    return () => {
      document.removeEventListener(eventType, handleClickOutside, {
        capture: true,
      });
    };
  }, [enabled, escapedIgnoreClass, ignoreClass, popoverSelector, store]);
}
