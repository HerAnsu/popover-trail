/**
 * Z-Index Elevation and Subtree Front Stacking Reducers for popover-trail.
 *
 * @module store/reducers/stack/stackElevation
 */

import type { PopoverStateData, StatePatch } from '../../../types';
import type { PopoverDAG } from '../../../utils/dag';
import { EMPTY_OBJECT } from '../../storeDefaults';
import { getAllDescendants } from './descendants';
import { getActiveKeys } from './recordFilter';

function isOrderUnchanged<TPopoverKey extends string>(
  prevOrder: readonly TPopoverKey[],
  nextOrder: readonly TPopoverKey[],
): boolean {
  if (prevOrder.length !== nextOrder.length) return false;
  return prevOrder.every((key, index) => key === nextOrder[index]);
}

/**
 * Pure state reducer elevating target popover key and its subtree to front of stacking order.
 */
export function bringToFrontPatch<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  dag?: PopoverDAG<TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  const descendants = getAllDescendants<TData, TPopoverKey>(
    [key],
    state.floating,
    state.trail,
    true,
    dag,
  );

  const keysToElevate: TPopoverKey[] = [key, ...descendants];
  const elevateSet = new Set<TPopoverKey>(keysToElevate);

  const activeKeys = getActiveKeys<TData, TPopoverKey>(state.floating, state.trail);
  const nextOrder = state.zIndexOrder.filter((k) => !elevateSet.has(k));
  for (const k of keysToElevate) {
    if (activeKeys.has(k)) {
      nextOrder.push(k);
    }
  }

  if (isOrderUnchanged(state.zIndexOrder, nextOrder)) {
    return EMPTY_OBJECT;
  }

  return {
    zIndexOrder: nextOrder,
  };
}
