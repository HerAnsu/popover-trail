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
import { shallowEqualArray } from '../../../utils/equality';
import { unique } from '../../../utils/collections';

/**
 * Pure state reducer elevating target popover key and its subtree to front of stacking order.
 *
 * @example
 * ```ts
 * const patch = bringToFrontPatch(state, 'card-2', dag);
 * if (patch.zIndexOrder) {
 *   store.setState(patch);
 * }
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Valid popover key union.
 * @param state - Current store state snapshot.
 * @param key - Popover key to elevate to front.
 * @param dag - Optional directed acyclic graph instance to resolve child keys.
 * @returns State patch with elevated zIndexOrder, or EMPTY_OBJECT if already frontmost.
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

  const keysToElevate: readonly TPopoverKey[] = unique([key, ...descendants]);
  const elevateSet = new Set<TPopoverKey>(keysToElevate);

  const activeKeys = getActiveKeys<TData, TPopoverKey>(state.floating, state.trail);
  const nextOrder = state.zIndexOrder.filter((k) => !elevateSet.has(k));
  for (const k of keysToElevate) {
    if (activeKeys.has(k)) {
      nextOrder.push(k);
    }
  }

  if (shallowEqualArray(state.zIndexOrder, nextOrder)) {
    return EMPTY_OBJECT;
  }

  return {
    zIndexOrder: nextOrder,
  };
}
