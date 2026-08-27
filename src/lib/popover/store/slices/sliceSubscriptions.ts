/**
 * Event & Key Subscription Domain Action Slice for popover-trail.
 * Encapsulates wildcard event listeners and reference-optimized key watchers.
 *
 * @module store/slices/sliceSubscriptions
 */

import type { TrailEntry, PopoverStoreEvent } from '../../types';
import { findEntryInStore } from '../../utils/storeHelpers';
import { isErr, wrapResult } from '../../utils/result';
import type { SliceContext } from './sliceContext';

/**
 * Factory creating subscription actions (`subscribeEvent`, `subscribeKey`).
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Popover key string union.
 * @param ctx - Store dependency injection slice context.
 * @returns Subscription action dispatch methods.
 */
export function createSubscriptionsSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(ctx: SliceContext<TData, TContext, TPopoverKey>) {
  const { get, deps } = ctx;
  const { eventListeners } = deps;

  return {
    subscribeEvent: (listener: (event: PopoverStoreEvent<TData>) => void) => {
      eventListeners.add(listener);
      return () => {
        eventListeners.delete(listener);
      };
    },

    subscribeKey: (
      key: TPopoverKey,
      listener: (
        entry: TrailEntry<TData, TPopoverKey> | undefined,
        prevEntry: TrailEntry<TData, TPopoverKey> | undefined,
      ) => void,
    ): (() => void) => {
      if (!key || typeof listener !== 'function') return () => {};

      let prevEntry = findEntryInStore<TData, TPopoverKey>(get().floating, get().trail, key);

      if (deps.subscribeState) {
        return deps.subscribeState((state, prevState) => {
          // Reference fast-path: updates replace list identities only when
          // their contents change, so equal references imply our entry is
          // unchanged — skip both O(n) lookups entirely.
          if (state.floating === prevState.floating && state.trail === prevState.trail) return;

          const currentEntry = findEntryInStore<TData, TPopoverKey>(
            state.floating,
            state.trail,
            key,
          );
          const oldEntry = findEntryInStore<TData, TPopoverKey>(
            prevState.floating,
            prevState.trail,
            key,
          );

          if (currentEntry !== prevEntry) {
            const lastPrev = prevEntry ?? oldEntry;
            prevEntry = currentEntry;

            const notifyResult = wrapResult(() => listener(currentEntry, lastPrev));
            if (isErr(notifyResult)) {
              console.error(
                `[popover-trail]: Exception in subscribeKey listener for "${key}":`,
                notifyResult.error,
              );
            }
          }
        });
      }

      return () => {};
    },
  };
}
