/**
 * Active State & Mounting Predicates for Popover Resolver Pipeline.
 *
 * @module store/slices/resolver/predicates
 */

import type { TrailEntry } from '../../../types';
import { TRANSITION_STATUS_UNMOUNTING } from '../../../constants';
import { isNonEmptyArray } from '../../../utils/typeGuards';

/**
 * Determines whether the requested root popover is already mounted and active in the trail.
 *
 * @template TData - Resolved popover data payload type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param trail - Active trailing popovers stack.
 * @param currentOwnerId - Current owner ID of the active root hierarchy.
 * @param finalOwnerId - Target owner ID requested by the caller.
 * @param key - Unique popover identifier.
 * @param forceRefresh - Whether to bypass cache and active status checks.
 * @returns `true` if the root popover is currently active under the same owner.
 */
export function isRootAlreadyActive<TData, TPopoverKey extends string>(
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  currentOwnerId: string | null | undefined,
  finalOwnerId: string,
  key: TPopoverKey,
  forceRefresh?: boolean,
): boolean {
  if (forceRefresh || !isNonEmptyArray(trail)) return false;
  const [root] = trail;
  if (!root) return false;
  const { key: rootKey, transitionStatus } = root;
  return (
    rootKey === key &&
    transitionStatus !== TRANSITION_STATUS_UNMOUNTING &&
    currentOwnerId === finalOwnerId
  );
}

/**
 * Determines whether a nested child popover is already mounted under the source parent.
 *
 * @template TData - Resolved popover data payload type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param existingEntry - Active popover entry instance if present.
 * @param sourceKey - Unique identifier of the initiating parent card.
 * @param forceRefresh - Whether to bypass cache and active status checks.
 * @returns `true` if the child popover is currently active under the specified parent.
 */
export function isNestedAlreadyActive<TData, TPopoverKey extends string>(
  existingEntry: TrailEntry<TData, TPopoverKey> | undefined,
  sourceKey: TPopoverKey,
  forceRefresh?: boolean,
): boolean {
  if (!existingEntry || forceRefresh) return false;
  const { transitionStatus, parentKey, originalParentKey } = existingEntry;
  if (transitionStatus === TRANSITION_STATUS_UNMOUNTING) return false;
  return parentKey === sourceKey || originalParentKey === sourceKey;
}

/**
 * Determines whether a popover is already mounted and active in the floating collection.
 *
 * @template TData - Resolved popover data payload type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param floating - Active modeless floating entries list.
 * @param key - Unique popover identifier.
 * @param forceRefresh - Whether to bypass cache and active status checks.
 * @returns `true` if the popover is active and not unmounting in the floating list.
 */
export function isFloatingActive<TData, TPopoverKey extends string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  key: TPopoverKey,
  forceRefresh?: boolean,
): boolean {
  if (forceRefresh) return false;
  return floating.some(
    ({ key: entryKey, transitionStatus }) =>
      entryKey === key && transitionStatus !== TRANSITION_STATUS_UNMOUNTING,
  );
}
