/**
 * Modeless Pinning & Layout Domain Action Slice for popover-trail.
 * Encapsulates pinning, z-index depth order, and drag coordinate offsets.
 *
 * @module slicePinning
 */

import { togglePinState, updateOffsetState } from '../reducers/pinReducers';
import { bringToFrontPatch } from '../reducers/stackReducers';
import { findEntryInStore } from '../../utils/storeHelpers';
import { selectIsPinned } from '../storeSelectors';
import { dispatchStoreEvent } from '../eventBus';
import { wrapResult, isErr } from '../../utils/result';
import type { SliceContext } from './sliceContext';

/**
 * Factory creating modeless pinning and floating layout actions (`togglePin`, `bringToFront`, `updateOffset`).
 */
export function createPinningSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(ctx: SliceContext<TData, TContext, TPopoverKey>) {
  const { set, get, deps } = ctx;
  const { findEntryByKey, pushSnapshot, eventListeners, transitionScheduler } = deps;

  return {
    togglePin: (key: TPopoverKey, rect?: DOMRect) => {
      if (!key) return;
      const targetEntry = findEntryByKey(key);
      if (!targetEntry) return;

      pushSnapshot(get());
      transitionScheduler.cancelHover(key);
      set((state) => togglePinState(state, key, rect));

      const entry = findEntryByKey(key);
      const isPinned = selectIsPinned(key)(get());

      dispatchStoreEvent(eventListeners, { type: isPinned ? 'pin' : 'unpin', key }, deps.eventBus);

      if (entry?.onPin) {
        const pinResult = wrapResult(() => entry.onPin?.(key, isPinned));
        if (isErr(pinResult)) {
          console.error('[popover-trail]: Exception in onPin callback:', pinResult.error);
        }
      }
    },

    bringToFront: (key: TPopoverKey) => {
      if (!key) return;
      set((state) => {
        const entry = findEntryInStore(state.floating, state.trail, key);
        if (!entry) return {};
        if (entry.transitionStatus === 'unmounting') return {};
        return bringToFrontPatch(state, key, deps.popoverDAG);
      });
    },

    updateOffset: (key: TPopoverKey, x: number, y: number) => {
      if (!key || !Number.isFinite(x) || !Number.isFinite(y)) return;
      const current = get().offsets[key];
      if (current?.x === x && current.y === y) return;
      set((state) => updateOffsetState(state, key, { x, y }));
    },
  };
}
