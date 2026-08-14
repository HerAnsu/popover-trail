/**
 * Modeless Pinning & Layout Domain Action Slice for popover-trail.
 * Encapsulates pinning, z-index depth order, and drag coordinate offsets.
 *
 * @module slicePinning
 */

import { togglePinState, bringToFrontPatch, findEntryInStore } from '../../utils/storeHelpers';
import { reduceUpdateOffsetState } from '../storeActions';
import { selectIsPinned } from '../storeSelectors';
import type { SliceContext } from './sliceContext';

export function createPinningSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(ctx: SliceContext<TData, TContext, TPopoverKey>) {
  const { set, get, deps } = ctx;
  const { clearHoverTimer, findEntryByKey, pushSnapshot, eventListeners } = deps;

  return {
    togglePin: (key: string, rect?: DOMRect) => {
      if (!key) return;
      pushSnapshot(get());
      clearHoverTimer(key);
      set((state) => togglePinState(state, key, rect));
      const entry = findEntryByKey(key);
      const isPinned = selectIsPinned(key)(get());
      if (eventListeners) {
        for (const listener of eventListeners) {
          try {
            listener({ type: isPinned ? 'pin' : 'unpin', key });
          } catch (err) {
            console.error('[popover-trail]: Exception in store event listener:', err);
          }
        }
      }
      try {
        entry?.onPin?.(key, isPinned);
      } catch (err) {
        console.error('[popover-trail]: Exception in onPin callback:', err);
      }
    },

    bringToFront: (key: string) => {
      if (!key) return;
      set((state) => {
        const entry = findEntryInStore(state.floating, state.trail, key);
        if (!entry) return {};
        if (state.zIndexOrder.at(-1) === key) return {};
        if (entry.transitionStatus === 'unmounting') return {};
        return bringToFrontPatch(state, key);
      });
    },

    updateOffset: (key: string, x: number, y: number) => {
      if (!key || !Number.isFinite(x) || !Number.isFinite(y)) return;
      const current = get().offsets[key];
      if (current && current.x === x && current.y === y) return;
      set((state) => reduceUpdateOffsetState(state, key, { x, y }));
    },
  };
}
