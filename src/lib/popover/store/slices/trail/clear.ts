/**
 * Clear Trail & Clear All Actions for Popover Trail.
 *
 * @module store/slices/trail/clear
 */

import { getCleanupStatePatch } from '../../reducers';
import { EMPTY_ARRAY } from '../../storeDefaults';
import { first } from '../../../utils/arrayUtils';
import type { SliceContext } from '../context';
import type { CloseTransitionOptions } from './close';
import { collectClosedEntryEffects } from './teardownHelpers';

/**
 * Creates the Trail Clear actions.
 *
 * @example
 * ```ts
 * const { clearTrail, clear } = createTrailClearActions(ctx, closeAllEntries);
 * clearTrail();
 * ```
 *
 * @template TData - Resolved popover data payload type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Slice context container with Zustand accessors.
 * @param closeAllEntries - Callback executing immediate or animated close of all cards.
 * @returns Trail clearing methods (`clearTrail`, `clear`).
 */
export function createTrailClearActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: SliceContext<TData, TContext, TPopoverKey>,
  closeAllEntries: (options?: CloseTransitionOptions) => void,
) {
  const { set, get, deps } = ctx;
  const { dispatchEffects } = deps;

  return {
    clearTrail: (_options?: { transition?: boolean } | boolean) => {
      const state = get();
      const {
        trail,
        floating,
        pinnedStates,
        offsets,
        zIndexOrder,
        nestedHydrationRequestCounters,
      } = state;

      if (trail.length === 0) return;

      const oldKeys = trail.map(({ key }) => key);
      const removedKeySet = new Set<TPopoverKey>(oldKeys);

      const nextPinnedStates = { ...pinnedStates };
      const closedEffects = collectClosedEntryEffects<TData, TPopoverKey, TContext>(
        removedKeySet,
        floating,
        EMPTY_ARRAY,
        nextPinnedStates,
      );

      const cleanupPatch = getCleanupStatePatch(
        floating,
        EMPTY_ARRAY,
        offsets,
        zIndexOrder,
        nextPinnedStates,
        nestedHydrationRequestCounters,
      );

      set({ trail: EMPTY_ARRAY, ...cleanupPatch });

      dispatchEffects([
        { type: 'RECORD_HISTORY_SNAPSHOT', state },
        { type: 'ABORT_IN_FLIGHT', keys: oldKeys },
        { type: 'CANCEL_TIMERS', keys: oldKeys },
        ...closedEffects,
        { type: 'EMIT_EVENT', event: { type: 'close', keys: oldKeys, key: first(oldKeys) } },
      ]);
    },

    clear: (options?: CloseTransitionOptions) => {
      closeAllEntries(options);
      dispatchEffects([{ type: 'EMIT_EVENT', event: { type: 'clear' } }]);
    },
  };
}
