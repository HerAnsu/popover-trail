/**
 * Capture-phase click-outside listener hook for PopoverProvider.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/useClickOutside
 */

import { useEffect } from 'react';
import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore, ClickOutsideConfig } from '../types';
import { isBrowser } from '../utils/typeGuards';
import { shouldIgnoreEvent, isClickInsidePopoverOrAnchor } from './clickOutsideHelpers';
import { useLatestRef } from './useHookUtils';

export interface UseClickOutsideOptions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TActions extends object = object,
> {
  store: StoreApi<PopoverStore<TData, TContext, TPopoverKey, TActions>>;
  clickOutside?: ClickOutsideConfig & {
    shouldIgnoreClick?: (e: PointerEvent | MouseEvent) => boolean;
  };
}

/**
 * Capture-phase click-outside listener hook for PopoverProvider.
 * Automatically clears active non-pinned cards when user clicks outside the popover hierarchy.
 *
 * @param options - Configuration including store instance and clickOutside options.
 *
 * @example
 * ```tsx
 * useClickOutside({
 *   store,
 *   clickOutside: {
 *     enabled: true,
 *     ignoreClass: 'ignore-popover-dismiss',
 *   },
 * });
 * ```
 */
export function useClickOutside<TData = unknown, TContext = unknown>({
  store,
  clickOutside,
}: UseClickOutsideOptions<TData, TContext>): void {
  const enabled = clickOutside?.enabled;
  const ignoreClass = clickOutside?.ignoreClass;
  const selector = clickOutside?.popoverSelector ?? '.popover-card';
  const ignoreRef = useLatestRef(clickOutside?.shouldIgnoreClick);

  useEffect(() => {
    if (!enabled) return;

    let lastInteractionTime = 0;
    const handleClickOutside = (e: Event) => {
      const now = Date.now();
      if (now - lastInteractionTime < 50 || shouldIgnoreEvent(e, ignoreRef.current)) return;

      const state = store.getState();
      if (
        isClickInsidePopoverOrAnchor(e, selector, ignoreClass, state.ownerId, state.anchorElement)
      ) {
        lastInteractionTime = now;
        return;
      }

      state.clearTrail({ transition: true });
    };

    const eventType = isBrowser() && 'PointerEvent' in window ? 'pointerdown' : 'mousedown';
    document.addEventListener(eventType, handleClickOutside, { capture: true });
    return () => {
      document.removeEventListener(eventType, handleClickOutside, { capture: true });
    };
  }, [enabled, ignoreClass, selector, store, ignoreRef]);
}
