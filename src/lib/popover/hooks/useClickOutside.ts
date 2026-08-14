import { useEffect, useMemo, useRef } from 'react';
import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore, ClickOutsideConfig } from '../types';
import { isPortalOrExcludedTarget, getEventPath, getEventTarget } from '../utils/domEvents';
import { TriggerRegistry } from '../utils/triggerRegistry';

export interface UseClickOutsideOptions<TData = unknown, TContext = unknown> {
  store: StoreApi<PopoverStore<TData, TContext>>;
  clickOutside?: ClickOutsideConfig & {
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
  el: HTMLElement,
  selector: string,
  escapedIgnoreClass?: string | null,
  ignoreClass?: string,
): boolean {
  try {
    if (el.matches(selector)) return true;
  } catch {
    // Ignore invalid selector
  }
  if (escapedIgnoreClass) {
    try {
      if (el.matches(escapedIgnoreClass)) return true;
    } catch {
      if (ignoreClass && el.classList.contains(ignoreClass)) return true;
    }
  }
  return false;
}

function isClickInsidePopover(
  path: EventTarget[],
  popoverSelector: string,
  escapedIgnoreClass?: string,
  ignoreClass?: string,
): boolean {
  return path.some(
    (el) =>
      el instanceof HTMLElement &&
      isElementMatchingPopover(el, popoverSelector, escapedIgnoreClass, ignoreClass),
  );
}

function isClickOnAnchor(
  path: EventTarget[],
  target: HTMLElement | null,
  anchorEl: Element | null | undefined,
): boolean {
  if (!anchorEl) return false;
  return path.includes(anchorEl) || (target ? anchorEl.contains(target) : false);
}

/**
 * Custom hook isolating click-outside capture phase event listener logic for PopoverProvider.
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

    const handleClickOutside = (e: PointerEvent | MouseEvent) => {
      if (isPortalOrExcludedTarget(e)) return;
      if (shouldIgnoreClickRef.current && shouldIgnoreClickRef.current(e)) return;

      const path = getEventPath(e);
      const target = getEventTarget<HTMLElement>(e) ?? (e.target as HTMLElement);
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
    document.addEventListener(eventType, handleClickOutside as EventListener, { capture: true });
    return () =>
      document.removeEventListener(eventType, handleClickOutside as EventListener, {
        capture: true,
      });
  }, [enabled, escapedIgnoreClass, ignoreClass, popoverSelector, store]);
}
