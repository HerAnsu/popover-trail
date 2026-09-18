import { useCallback } from 'react';
import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore } from '../types';
import { useEventListener } from '../hooks/useEventListener';
import { isEscapeKey } from '../utils/typeGuards';

/**
 * Internal hook managing global keyboard shortcuts (Escape key dismissal) for the popover provider.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @param store - Root Zustand store API instance.
 * @param enableKeyboardClose - Whether Escape key dismissal is enabled.
 */
export function usePopoverKeyboardShortcuts<TData, TContext>(
  store: StoreApi<PopoverStore<TData, TContext>>,
  enableKeyboardClose: boolean,
): void {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enableKeyboardClose || e.defaultPrevented) return;
      if (isEscapeKey(e)) {
        const state = store.getState();
        const { trail, floating, closeTopmost } = state;
        const hasActive = trail.length > 0 || floating.length > 0;
        if (hasActive) {
          e.preventDefault();
          e.stopPropagation();
          closeTopmost();
        }
      }
    },
    [enableKeyboardClose, store],
  );

  useEventListener('keydown', handleKeyDown);
}
