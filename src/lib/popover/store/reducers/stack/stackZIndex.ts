/**
 * Z-Index Ordering and Layer Stacking Calculator for popover-trail.
 *
 * @module store/reducers/stack/stackZIndex
 */

import { last } from '../../../utils/arrayUtils';
import { and } from '../../../utils/functional';

export { bringToFrontPatch } from './stackElevation';

/**
 * Computes next z-index ordering placing the active key at the top.
 *
 * @example
 * ```ts
 * const activeKeys = new Set(['card-1', 'card-2']);
 * const nextOrder = getNextZIndexOrder(['card-1', 'card-2'], activeKeys, 'card-1');
 * // => ['card-2', 'card-1']
 * ```
 *
 * @template TPopoverKey - Valid popover key union.
 * @param currentOrder - Current readonly array of keys in stacking order.
 * @param activeKeys - Set of currently active/open keys in the store.
 * @param activeKey - Popover key to place at top of stacking order.
 * @returns Reordered array of keys, or currentOrder if already properly ordered.
 */
export function getNextZIndexOrder<TPopoverKey extends string = string>(
  currentOrder: readonly TPopoverKey[],
  activeKeys: ReadonlySet<TPopoverKey>,
  activeKey: TPopoverKey,
): readonly TPopoverKey[] {
  if (
    last(currentOrder) === activeKey &&
    currentOrder.length === activeKeys.size &&
    currentOrder.every((k) => activeKeys.has(k))
  ) {
    return currentOrder;
  }

  const isRetainedOrderKey = and(
    (k: TPopoverKey) => activeKeys.has(k),
    (k: TPopoverKey) => k !== activeKey,
  );
  const nextOrder = currentOrder.filter(isRetainedOrderKey);
  if (activeKeys.has(activeKey)) {
    nextOrder.push(activeKey);
  }
  return nextOrder;
}
