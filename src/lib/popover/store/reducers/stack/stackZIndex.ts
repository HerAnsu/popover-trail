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
