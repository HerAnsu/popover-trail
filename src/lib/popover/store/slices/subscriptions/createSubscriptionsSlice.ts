/**
 * Subscriptions & Event Bus Domain Action Slice for popover-trail.
 * Encapsulates global event listening and single-popover state subscription listeners.
 *
 * @module store/slices/subscriptions/createSubscriptionsSlice
 */

import { selectEntryByKey } from '../../storeSelectors';
import { areEntriesShallowEqual } from '../../reducers/stack';
import { safeCallback } from '../../../utils/safeCallback';
import { isTrailEntry } from '../../../utils/typeGuards';
import type { PopoverStore, SubscriptionsSliceActions, TrailEntry } from '../../../types';
import type { SubscriptionsSliceContext } from '../context';
import { noop } from '../../../utils/functional';

/**
 * Creates the Subscriptions and Event Bus domain slice.
 *
 * @example
 * ```ts
 * const subSlice = createSubscriptionsSlice(ctx);
 * const unsubscribe = subSlice.subscribeEvent((event) => {
 *   console.log('Store event:', event.type);
 * });
 * ```
 *
 * @template TData - Resolved popover data payload type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Slice context container with Zustand accessors.
 * @returns Event subscription and key-scoped listener actions.
 */
export function createSubscriptionsSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: SubscriptionsSliceContext<TData, TContext, TPopoverKey>,
): SubscriptionsSliceActions<TData, TContext, TPopoverKey> {
  const { get, deps } = ctx;
  const { eventListeners, subscribeState } = deps;

  return {
    subscribeEvent: (listener) => {
      eventListeners.add(listener);
      return () => {
        eventListeners.delete(listener);
      };
    },

    subscribeKey: <K extends TPopoverKey = TPopoverKey, KData = TData>(
      key: K,
      callback: (
        entry: TrailEntry<KData, K> | undefined,
        prevEntry: TrailEntry<KData, K> | undefined,
      ) => void,
    ) => {
      if (!subscribeState) return noop;

      const selectKey = selectEntryByKey<TData, TPopoverKey>(key);
      let prevEntry = selectKey(get());

      return subscribeState(
        (
          state: PopoverStore<TData, TContext, TPopoverKey>,
          prevState: PopoverStore<TData, TContext, TPopoverKey>,
        ) => {
          const currentEntry = selectKey(state);
          const previousEntryFromState = selectKey(prevState);
          const effectivePrev = previousEntryFromState ?? prevEntry;

          const isChanged =
            currentEntry !== effectivePrev &&
            (!currentEntry ||
              !effectivePrev ||
              !areEntriesShallowEqual(currentEntry, effectivePrev));

          if (isChanged) {
            prevEntry = currentEntry;
            const targetCurrent =
              currentEntry && isTrailEntry<KData, K>(currentEntry) ? currentEntry : undefined;
            const targetPrev =
              effectivePrev && isTrailEntry<KData, K>(effectivePrev) ? effectivePrev : undefined;
            safeCallback(callback, [targetCurrent, targetPrev], {
              contextName: 'subscribeKey',
            });
          }
        },
      );
    },
  };
}
