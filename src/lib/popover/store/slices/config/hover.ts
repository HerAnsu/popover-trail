/**
 * Hover Intent & Delay Management Domain Action Sub-Slice for popover-trail.
 * Manages hover enter/leave timers and automatic hierarchy dismissal.
 *
 * @module store/slices/config/hover
 */

import type { ConfigSliceActions } from '../../../types';
import type { ConfigSliceContext } from '../context';
import { isPinnedEntry } from '../../actions/storeActions';
import { DEFAULT_HOVER_CLOSE_DELAY_MS } from '../../../constants';

export type HoverSliceActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Pick<ConfigSliceActions<TData, TContext, TPopoverKey>, 'hoverEnter' | 'hoverLeave'> & {
  /** Cancels any pending hover leave timer for the specified popover key. */
  cancelHover: (key: TPopoverKey) => void;
};

/**
 * Creates the Hover Intent and Delay action sub-slice.
 * Provides hierarchical hover cancellation and scheduled dismissal.
 *
 * @example
 * ```ts
 * const hoverSlice = createHoverSlice(ctx);
 * hoverSlice.hoverEnter('card-1');
 * hoverSlice.hoverLeave('card-1', 150);
 * ```
 *
 * @template TData - Resolved popover data payload type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Slice dependency injection context.
 * @returns Object implementing HoverSliceActions methods.
 */
export function createHoverSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: ConfigSliceContext<TData, TContext, TPopoverKey>,
): HoverSliceActions<TData, TContext, TPopoverKey> {
  const { get, deps } = ctx;
  const { transitionScheduler, popoverDAG, findEntryByKey } = deps;

  return {
    /** Cancels pending hover dismissal on the key and all its ancestor tree. */
    hoverEnter: (key: TPopoverKey) => {
      if (!key) return;
      if (popoverDAG?.hasNode(key)) {
        transitionScheduler.cancelHover(key);
        for (const ancestorKey of popoverDAG.getAncestors(key)) {
          transitionScheduler.cancelHover(ancestorKey);
        }
        return;
      }
      let currentKey: TPopoverKey | undefined = key;
      const visited = new Set<TPopoverKey>();
      while (currentKey && !visited.has(currentKey)) {
        visited.add(currentKey);
        transitionScheduler.cancelHover(currentKey);
        const entry = findEntryByKey(currentKey);
        currentKey = entry?.parentKey ?? entry?.originalParentKey;
      }
    },

    /** Schedules delayed dismissal if the card is not pinned. */
    hoverLeave: (key: TPopoverKey, delay = DEFAULT_HOVER_CLOSE_DELAY_MS) => {
      if (!key) return;
      const { pinnedStates } = get();
      if (isPinnedEntry(pinnedStates, key)) return;
      const performClose = () => {
        const { pinnedStates: currentPinned, actions } = get();
        if (isPinnedEntry(currentPinned, key)) return;
        actions.closeByKey(key, { transition: true });
      };
      transitionScheduler.scheduleHoverLeave(key, delay, performClose);
    },

    /** Clears any active scheduled hover timers. */
    cancelHover: (key: TPopoverKey) => {
      if (!key) return;
      transitionScheduler.cancelHover(key);
    },
  };
}
