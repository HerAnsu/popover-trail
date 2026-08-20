import { useCallback } from 'react';
import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore } from '../types';
import { useEventListener } from '../hooks/useEventListener';

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
      if (e.key === 'Escape') {
        const state = store.getState();
        const hasActive = state.trail.length > 0 || state.floating.length > 0;
        if (hasActive) {
          e.preventDefault();
          e.stopPropagation();
          state.closeTopmost();
        }
      }
    },
    [enableKeyboardClose, store],
  );

  useEventListener('keydown', handleKeyDown);
}
