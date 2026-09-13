/**
 * Z-Index Ordering and Layer Stacking Calculator for popover-trail.
 *
 * @module store/reducers/stack/stackZIndex
 */

import { last } from '../../../utils/arrayUtils';

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

  const nextOrder = currentOrder.filter((k) => activeKeys.has(k) && k !== activeKey);
  if (activeKeys.has(activeKey)) {
    nextOrder.push(activeKey);
  }
  return nextOrder;
}
