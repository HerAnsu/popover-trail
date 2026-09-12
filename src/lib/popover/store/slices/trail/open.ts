/**
 * Open & Push Actions for Popover Trail.
 * Encapsulates opening root popover cards and pushing nested cards into the cascade DAG.
 *
 * @module store/slices/trail/open
 */

import type { PopoverActions, TrailEntry } from '../../../types';
import { findEntryIndex, getEntryAtIndex } from '../../../utils/storeHelpers';
import { openRootState, pushNestedState } from '../../reducers/open';
import { EMPTY_ARRAY } from '../../storeDefaults';
import type { SliceContext } from '../context';
import { pruneDAGNodes, pruneTruncatedTrailNodes } from './dagHelpers';

export type TrailOpenActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Pick<
  PopoverActions<TData, TContext, TPopoverKey>,
  'openRoot' | 'pushNested' | 'pushNestedByKey'
>;

/**
 * Creates the Trail Open and Nested Push actions.
 */
export function createTrailOpenActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(ctx: SliceContext<TData, TContext, TPopoverKey>): TrailOpenActions<TData, TContext, TPopoverKey> {
  const { set, get, deps } = ctx;
  const { popoverDAG, dispatchEffects } = deps;

  const pushNested = (index: number, entry: TrailEntry<TData, TPopoverKey>) => {
    const state = get();
    const { floating, trail } = state;
    const isFloating = index < floating.length;
    const parentEntry = getEntryAtIndex(floating, trail, index);
    if (!parentEntry) return;

    if (isFloating) {
      pruneDAGNodes(popoverDAG, trail, floating, EMPTY_ARRAY);
    } else {
      pruneTruncatedTrailNodes(popoverDAG, floating, trail, index - floating.length);
    }

    const { key: childKey } = entry;
    const { key: parentKey } = parentEntry;

    dispatchEffects([
      { type: 'RECORD_HISTORY_SNAPSHOT', state },
      { type: 'ADD_DAG_NODE', key: childKey, parentKey },
    ]);

    set((s) => pushNestedState(s, index, entry));
    dispatchEffects([
      { type: 'EMIT_EVENT', event: { type: 'push_nested', key: childKey, parentKey } },
      { type: 'NOTIFY_USER_CALLBACK', key: childKey, callbackType: 'onOpen' },
    ]);
  };

  return {
    openRoot: (ownerId, entry) => {
      const state = get();
      const { key } = entry;

      dispatchEffects([
        { type: 'RECORD_HISTORY_SNAPSHOT', state },
        { type: 'ADD_DAG_NODE', key },
      ]);
      set((s) => openRootState(s, ownerId, entry));
      dispatchEffects([
        { type: 'EMIT_EVENT', event: { type: 'open_root', key, ownerId } },
        { type: 'NOTIFY_USER_CALLBACK', key, callbackType: 'onOpen' },
      ]);
    },

    pushNested,

    pushNestedByKey: (parentKey, entry) => {
      const { floating, trail } = get();
      const parentIndex = findEntryIndex(floating, trail, parentKey);
      if (parentIndex >= 0) pushNested(parentIndex, entry);
    },
  };
}
