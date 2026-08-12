import { useEffect } from 'react';
import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore, ClickOutsideConfig } from '../types';
import { isPortalOrExcludedTarget, getEventPath, getEventTarget } from '../utils/storeHelpers';
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
  escapedIgnoreClass?: string,
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

  const escapedIgnoreClass = useMemo(() => escapeCSSClass(ignoreClass), [ignoreClass]);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (e: PointerEvent | MouseEvent) => {
      if (isPortalOrExcludedTarget(e)) return;
      if (shouldIgnoreClick && shouldIgnoreClick(e)) return;

      const path = getEventPath(e);
      const target = getEventTarget<HTMLElement>(e) ?? (e.target as HTMLElement);
      const state = store.getState();

      const clickedInside = path.some((el) => {
        if (el instanceof HTMLElement) {
          return isElementMatchingPopover(el, popoverSelector, escapedIgnoreClass, ignoreClass);
        }
        return false;
      });

      if (clickedInside) return;

      const anchorEl = TriggerRegistry.get(state.ownerId ?? '') ?? state.anchorElement;
      if (anchorEl && (path.includes(anchorEl) || anchorEl.contains(target))) {
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
  }, [enabled, ignoreClass, popoverSelector, shouldIgnoreClick, store]);
}
