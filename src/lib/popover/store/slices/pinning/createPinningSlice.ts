/**
 * Modeless Pinning & Layout Domain Action Slice for popover-trail.
 * Encapsulates pinning, z-index depth order, and drag coordinate offsets.
 *
 * @module store/slices/pinning/createPinningSlice
 */

import type { DragOffset, PinningSliceActions } from '../../../types';
import { togglePinState, updateOffsetState, bringToFrontPatch } from '../../reducers';
import { selectIsPinned, ZERO_OFFSET } from '../../storeSelectors';
import { TRANSITION_STATUS_UNMOUNTING } from '../../../constants';
import { toDragOffset } from '../../../utils/dragMath';
import { findEntryInStore } from '../../../utils/storeHelpers';
import { EMPTY_OBJECT } from '../../storeDefaults';
import type { PinningSliceContext } from '../context';

/**
 * Creates the Pinning & Layout domain slice.
 *
 * @example
 * ```ts
 * const pinningSlice = createPinningSlice(ctx);
 * pinningSlice.togglePin('card-1');
 * pinningSlice.bringToFront('card-1');
 * pinningSlice.updateOffset('card-1', 50, 100);
 * ```
 *
 * @template TData - Resolved popover data payload type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Slice context container with Zustand accessors.
 * @returns Modeless pinning, z-index, and drag offset actions.
 */
export function createPinningSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: PinningSliceContext<TData, TContext, TPopoverKey>,
): PinningSliceActions<TData, TContext, TPopoverKey> {
  const { set, get, deps } = ctx;
  const { popoverDAG, dispatchEffects } = deps;

  return {
    togglePin: (key, rect) => {
      if (!key) return;
      const stateBefore = get();
      const { floating, trail } = stateBefore;
      const targetEntry = findEntryInStore(floating, trail, key);
      if (!targetEntry) return;

      dispatchEffects([
        { type: 'RECORD_HISTORY_SNAPSHOT', state: stateBefore },
        { type: 'CANCEL_TIMER_FOR_KEY', key },
      ]);

      set((state) => togglePinState(state, key, rect));

      const isPinned = selectIsPinned<TPopoverKey>(key)(get());

      dispatchEffects([
        { type: 'EMIT_EVENT', event: { type: isPinned ? 'pin' : 'unpin', key } },
        { type: 'NOTIFY_USER_CALLBACK', key, callbackType: 'onPin', payload: isPinned },
      ]);
    },

    bringToFront: (key) => {
      if (!key) return;
      set((state) => {
        const { floating, trail } = state;
        const entry = findEntryInStore(floating, trail, key);
        if (!entry || entry.transitionStatus === TRANSITION_STATUS_UNMOUNTING) {
          return EMPTY_OBJECT;
        }
        return bringToFrontPatch(state, key, popoverDAG);
      });
    },

    updateOffset: (key, xOrOffset, maybeY) => {
      if (!key) return;
      let nextOffset: DragOffset;
      if (typeof xOrOffset === 'number' && typeof maybeY === 'number') {
        nextOffset = toDragOffset(xOrOffset, maybeY);
      } else if (typeof xOrOffset === 'function') {
        const { offsets } = get();
        const current = offsets[key] ?? ZERO_OFFSET;
        nextOffset = xOrOffset(current);
      } else if (typeof xOrOffset === 'object' && xOrOffset !== null) {
        nextOffset = xOrOffset;
      } else {
        return;
      }

      set((state) => updateOffsetState(state, key, nextOffset));
    },
  };
}
