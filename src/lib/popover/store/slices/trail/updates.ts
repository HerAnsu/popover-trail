/**
 * Synchronous Trail State Modification Actions for popover-trail.
 *
 * @module store/slices/trail/updates
 */

import type { PopoverActions, TrailEntry } from '../../../types';
import { patchEntryInLists } from '../../reducers/stack';
import { pruneDAGNodes } from './dagHelpers';
import type { SliceContext } from '../context';

type EntryList<TData, TPopoverKey extends string> = readonly TrailEntry<TData, TPopoverKey>[];
type ListOrUpdater<TData, TPopoverKey extends string> =
  | EntryList<TData, TPopoverKey>
  | ((prev: EntryList<TData, TPopoverKey>) => EntryList<TData, TPopoverKey>);

export type TrailUpdateActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Pick<
  PopoverActions<TData, TContext, TPopoverKey>,
  'updateEntry' | 'patchEntry' | 'setTrail' | 'setFloating'
>;

/**
 * Creates synchronous list modification actions for trail and floating entries.
 * Manages DAG consistency pruning whenever collection structures change.
 *
 * @example
 * ```ts
 * const updateActions = createTrailUpdateActions(ctx);
 * updateActions.updateEntry('card-1', { data: newPayload });
 * ```
 *
 * @template TData - Resolved popover data payload type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Slice dependency injection context.
 * @returns Object implementing TrailUpdateActions methods.
 */
export function createTrailUpdateActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: SliceContext<TData, TContext, TPopoverKey>,
): TrailUpdateActions<TData, TContext, TPopoverKey> {
  const { set, deps } = ctx;
  const { popoverDAG } = deps;

  const createListSetter =
    (targetList: 'trail' | 'floating') => (nextOrFn: ListOrUpdater<TData, TPopoverKey>) => {
      set((state) => {
        const { floating, trail } = state;
        const currentList = state[targetList];
        const next = typeof nextOrFn === 'function' ? nextOrFn(currentList) : nextOrFn;
        pruneDAGNodes(
          popoverDAG,
          currentList,
          targetList === 'trail' ? floating : next,
          targetList === 'trail' ? next : trail,
        );
        return { [targetList]: next };
      });
    };

  return {
    /** Overwrites shallow properties of an entry identified by key. */
    updateEntry: (key, updatedEntry) => {
      set(({ floating, trail }) =>
        patchEntryInLists(floating, trail, key, (entry) => ({ ...entry, ...updatedEntry })),
      );
    },

    /** Dynamically transforms an entry identified by key via a mapping updater. */
    patchEntry: (key, updater) => {
      set(({ floating, trail }) => patchEntryInLists(floating, trail, key, updater));
    },

    /** Atomically replaces or updates the cascade trail array. */
    setTrail: createListSetter('trail'),

    /** Atomically replaces or updates the detached floating cards array. */
    setFloating: createListSetter('floating'),
  };
}
