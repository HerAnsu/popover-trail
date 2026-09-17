/**
 * Safe State Patch Applier with Middleware and Revision Increment.
 *
 * @module storeSafeSet
 */

import type { StatePatch, PopoverStore } from '../../types';
import type { PopoverMiddlewareEngine } from '../storeMiddlewareEngine';
import { isEmptyRecord } from '../../utils/cleanObject';

export type SafeSetFn<TData, TContext, TPopoverKey extends string> = (
  partial:
    | StatePatch<TData, TContext, TPopoverKey>
    | ((
        state: PopoverStore<TData, TContext, TPopoverKey>,
      ) => StatePatch<TData, TContext, TPopoverKey>),
) => void;

export function createSafeSet<
  TStore extends PopoverStore<TData, TContext, TPopoverKey>,
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  set: (updater: (state: TStore) => Partial<TStore> | TStore) => void,
  get: () => TStore,
  middlewareEngine: PopoverMiddlewareEngine<TData, TContext, TPopoverKey>,
): SafeSetFn<TData, TContext, TPopoverKey> {
  return (partial) => {
    set((state) => {
      const patch = typeof partial === 'function' ? partial(state) : partial;
      const nextPatch = middlewareEngine.apply(patch, state);

      if (!nextPatch) return state;
      if (typeof nextPatch === 'object' && isEmptyRecord(nextPatch)) return state;

      const patchWithRevision = {
        ...nextPatch,
        stateRevision: (get().stateRevision ?? 0) + 1,
      };
      return patchWithRevision as Partial<TStore>;
    });
  };
}
