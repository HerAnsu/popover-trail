/**
 * Lifecycle & Transition Status Domain Action Sub-Slice for popover-trail.
 * Manages transition status states (mounting, mounted, unmounting).
 *
 * @module store/slices/config/lifecycle
 */

import type { ConfigSliceActions, PopoverTransitionStatus } from '../../../types';
import { patchEntryInLists } from '../../reducers/stack';
import { isValidTransitionStatusChange } from '../../fsm';
import type { ConfigSliceContext } from '../context';

export type LifecycleSliceActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Pick<ConfigSliceActions<TData, TContext, TPopoverKey>, 'setTransitionStatus'>;

/**
 * Creates the Lifecycle transition status action sub-slice.
 */
export function createLifecycleSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: ConfigSliceContext<TData, TContext, TPopoverKey>,
): LifecycleSliceActions<TData, TContext, TPopoverKey> {
  const { set, deps } = ctx;
  const { findEntryByKey } = deps;

  return {
    setTransitionStatus: (key: TPopoverKey, status: PopoverTransitionStatus) => {
      if (!key) return;
      const entry = findEntryByKey(key);
      if (!entry || entry.transitionStatus === status) return;
      if (!isValidTransitionStatusChange(entry.transitionStatus, status)) return;

      set((state) =>
        patchEntryInLists<TData, TContext, TPopoverKey>(
          state.floating,
          state.trail,
          key,
          (prev) => ({
            ...prev,
            transitionStatus: status,
          }),
        ),
      );
    },
  };
}
