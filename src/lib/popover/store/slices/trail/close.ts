/**
 * Close Actions for Popover Trail Hierarchy.
 * Encapsulates subtree cascading teardown, key-scoped close, and clear actions.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/slices/trail/close
 */

import type { PopoverActions } from '../../../types';
import { findEntryIndex } from '../../../utils/storeHelpers';
import { getRemovedKeysForClose } from '../../reducers';
import { selectTopmostEntry } from '../../storeSelectors';
import type { SliceContext } from '../context';
import { createTrailClearActions } from './clear';
import { collectActiveKeySet } from './dagHelpers';

export type CloseTransitionOptions = { transition?: boolean } | boolean;

const isForceImmediate = (o?: CloseTransitionOptions): boolean =>
  o === false || (typeof o === 'object' && o !== null && o.transition === false);

export type TrailCloseActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Pick<
  PopoverActions<TData, TContext, TPopoverKey>,
  'closeFrom' | 'close' | 'closeByKey' | 'closeAll' | 'closeTopmost' | 'clearTrail' | 'clear'
>;

export function createTrailCloseActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: SliceContext<TData, TContext, TPopoverKey>,
  closeByTargetKeys: (
    keys: Set<TPopoverKey>,
    pushHistory: boolean,
    forceImmediate?: boolean,
  ) => void,
): TrailCloseActions<TData, TContext, TPopoverKey> {
  const { get, deps } = ctx;
  const { popoverDAG, resetStoreState } = deps;

  const closeFromIndex = (index: number, options?: CloseTransitionOptions): void => {
    if (index === -1) return;
    const { floating, trail, closePinnedDescendants, pinnedStates } = get();
    const removal = getRemovedKeysForClose(
      floating,
      trail,
      index,
      closePinnedDescendants,
      pinnedStates,
      popoverDAG,
    );
    if (removal) closeByTargetKeys(removal.removedKeys, true, isForceImmediate(options));
  };

  const closeFromKey = (key: TPopoverKey, options?: CloseTransitionOptions): void => {
    closeFromIndex(findEntryIndex(get().floating, get().trail, key), options);
  };

  const closeTopmostEntry = (options?: CloseTransitionOptions): void => {
    const key = selectTopmostEntry(get())?.key;
    if (key) closeFromKey(key, options);
  };

  const closeAllEntries = (options?: CloseTransitionOptions): void => {
    const forceImmediate = isForceImmediate(options);
    const { floating, trail, exitTransitionDuration } = get();
    const allKeys = collectActiveKeySet(floating, trail);
    closeByTargetKeys(allKeys, true, forceImmediate);
    const hasTransition = !forceImmediate && (exitTransitionDuration ?? 0) > 0;
    if (!hasTransition) {
      resetStoreState?.();
      popoverDAG?.clear();
    }
  };

  return {
    closeFrom: closeFromIndex,
    close: closeTopmostEntry,
    closeByKey: closeFromKey,
    closeTopmost: closeTopmostEntry,
    closeAll: closeAllEntries,
    ...createTrailClearActions(ctx, closeAllEntries),
  };
}
