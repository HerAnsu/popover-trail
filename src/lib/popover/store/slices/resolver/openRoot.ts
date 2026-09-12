/**
 * Root Popover Resolution Action for popover-trail.
 *
 * @module store/slices/resolver/openRoot
 */

import type { PopoverActions, TrailEntry } from '../../../types';
import { openRootState } from '../../reducers/open';
import { DEFAULT_OWNER_ID, ROOT_CONTROLLER_KEY } from '../../constants';
import { stopEventPropagation } from '../../../utils/domGuards';
import type { SliceContext } from '../context';
import { cancelStaleActiveKeys, notifyEntryOpen, resolveTriggerBoundingRect } from './helpers';
import { isFloatingActive, isRootAlreadyActive } from './predicates';

/**
 * Creates the action for resolving and mounting root popovers.
 */
export function createResolverOpenRootAction<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: SliceContext<TData, TContext, TPopoverKey>,
  bringToFront: (key: TPopoverKey) => void,
): PopoverActions<TData, TContext, TPopoverKey>['openRootWithResolver'] {
  const { get, deps } = ctx;
  const {
    pushSnapshot,
    popoverDAG,
    resolvePopoverEntry,
    findEntryByKey,
    emitStoreEvent,
    incrementRootCounter,
    isRootStale,
  } = deps;

  return async (key, anchorEvent, options) => {
    stopEventPropagation(anchorEvent);
    const state = get();
    const { floating, trail, ownerId } = state;
    const finalOwnerId = options?.ownerId ?? ownerId ?? DEFAULT_OWNER_ID;

    if (isFloatingActive(floating, key, options?.forceRefresh)) {
      bringToFront(key);
      return;
    }
    if (isRootAlreadyActive(trail, ownerId, finalOwnerId, key, options?.forceRefresh)) {
      bringToFront(key);
      return;
    }

    pushSnapshot(state);
    const oldRootKey = trail[0]?.key;
    if (trail.length > 0 && (finalOwnerId !== ownerId || oldRootKey !== key)) {
      cancelStaleActiveKeys(
        trail.map(({ key: k }) => k),
        deps,
      );
    }
    popoverDAG?.addNode(key);

    const rect = resolveTriggerBoundingRect(anchorEvent, options?.triggerRect);

    await resolvePopoverEntry({
      key,
      parentKey: undefined,
      rect,
      parentData: undefined,
      options,
      controllerKey: ROOT_CONTROLLER_KEY,
      incrementCounter: incrementRootCounter,
      isStale: isRootStale,
      insertStatePatch: (entry: TrailEntry<TData, TPopoverKey>) => (s) =>
        openRootState(s, finalOwnerId, entry),
    });

    emitStoreEvent({ type: 'open_root', key, ownerId: finalOwnerId });
    notifyEntryOpen(findEntryByKey, key);
  };
}
