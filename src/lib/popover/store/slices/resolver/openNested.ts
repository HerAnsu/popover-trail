/**
 * Nested Popover Resolution Action for popover-trail.
 *
 * @module store/slices/resolver/openNested
 */

import type { PopoverActions, TrailEntry } from '../../../types';
import { findEntryIndex, getEntryAtIndex } from '../../../utils/storeHelpers';
import { pushNestedState } from '../../reducers/open';
import { TRANSITION_STATUS_UNMOUNTING } from '../../../constants';
import type { SliceContext } from '../context';
import { notifyEntryOpen, resolveTriggerBoundingRect } from './helpers';
import { isNestedAlreadyActive } from './predicates';

/**
 * Creates the action for resolving and mounting nested child popovers.
 *
 * @example
 * ```ts
 * const openNestedWithResolver = createResolverOpenNestedAction(ctx, bringToFront);
 * await openNestedWithResolver('detailsCard', 'parentCard');
 * ```
 *
 * @template TData - Resolved popover data payload type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Slice context container with Zustand accessors.
 * @param bringToFront - Callback to elevate popover z-index.
 * @returns Async function resolving and pushing a nested child popover.
 */
export function createResolverOpenNestedAction<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: SliceContext<TData, TContext, TPopoverKey>,
  bringToFront: (key: TPopoverKey) => void,
): PopoverActions<TData, TContext, TPopoverKey>['openNestedWithResolver'] {
  const { get, deps } = ctx;
  const {
    findEntryByKey,
    pushSnapshot,
    popoverDAG,
    resolvePopoverEntry,
    emitStoreEvent,
    incrementNestedCounter,
    isNestedStale,
  } = deps;

  return async (key, sourceKey, options, anchorEvent) => {
    const existing = findEntryByKey(key);
    if (isNestedAlreadyActive(existing, sourceKey, options?.forceRefresh)) {
      bringToFront(key);
      return;
    }

    const state = get();
    const { floating, trail } = state;
    const parentIndex = findEntryIndex(floating, trail, sourceKey);
    const parentEntry = getEntryAtIndex(floating, trail, parentIndex);
    if (!parentEntry || parentEntry.transitionStatus === TRANSITION_STATUS_UNMOUNTING) return;
    const { data: parentData, rect: parentRect } = parentEntry;

    pushSnapshot(state);
    popoverDAG?.addNode(key, sourceKey);

    const rect = resolveTriggerBoundingRect(anchorEvent, options?.triggerRect) ?? parentRect;

    await resolvePopoverEntry({
      key,
      parentKey: sourceKey,
      rect: rect ?? null,
      parentData,
      options,
      controllerKey: key,
      incrementCounter: () => incrementNestedCounter(sourceKey),
      isStale: (started) => isNestedStale(sourceKey, started),
      insertStatePatch: (entry: TrailEntry<TData, TPopoverKey>) => (s) =>
        pushNestedState(s, parentIndex, entry),
    });

    emitStoreEvent({ type: 'push_nested', key, parentKey: sourceKey });
    notifyEntryOpen(findEntryByKey, key);
  };
}
