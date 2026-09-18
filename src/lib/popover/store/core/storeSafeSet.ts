/**
 * Safe State Patch Applier with Middleware and Revision Increment.
 *
 * @module storeSafeSet
 */

import type { StatePatch, PopoverStore } from '../../types';
import type { PopoverMiddlewareEngine } from '../storeMiddlewareEngine';
import { isEmptyRecord } from '../../utils/cleanObject';

/**
 * Dispatches a partial state patch or patch producer through middleware.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param partial - Partial state patch object or updater function.
 */
export type SafeSetFn<TData, TContext, TPopoverKey extends string> = (
  partial:
    | StatePatch<TData, TContext, TPopoverKey>
    | ((
        state: PopoverStore<TData, TContext, TPopoverKey>,
      ) => StatePatch<TData, TContext, TPopoverKey>),
) => void;

/**
 * Creates a safe state patch applier that runs middleware and increments state revision.
 *
 * @template TStore - Popover store type.
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param set - Raw store setter function.
 * @param get - Raw store getter function.
 * @param middlewareEngine - Middleware interceptor engine.
 * @returns SafeSetFn dispatching patches through middleware.
 *
 * @example
 * ```typescript
 * const safeSet = createSafeSet(set, get, middlewareEngine);
 * safeSet({ activeStackGroup: 'groupA' });
 * ```
 */
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

      const { stateRevision = 0 } = get();
      const patchWithRevision = {
        ...nextPatch,
        stateRevision: stateRevision + 1,
      };
      return patchWithRevision as Partial<TStore>;
    });
  };
}
