/**
 * Calculation Engine for Popover Cascade Subtree Teardown.
 *
 * @module store/reducers/close/closeCalculation
 */

import type { TrailEntry } from '../../../types';
import type { PopoverDAG } from '../../../utils/dag';
import { getDirectClosedKeys } from './closeHierarchy';
import { resolveAllRemovedKeys } from './closeKeys';

export interface RemovedKeysCloseResult<TPopoverKey extends string = string> {
  readonly isFloating: boolean;
  readonly removedKeys: Set<TPopoverKey>;
}

/**
 * Computes the set of popover keys to remove when closing from a target index.
 */
export function getRemovedKeysForClose<TData = unknown, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  index: number,
  closePinnedDescendants: boolean,
  pinnedStates?: Readonly<Partial<Record<TPopoverKey, boolean>>>,
  dag?: PopoverDAG<TPopoverKey>,
): RemovedKeysCloseResult<TPopoverKey> | null {
  const totalCount = floating.length + trail.length;
  if (index < 0 || index >= totalCount) return null;

  const isFloating = index < floating.length;
  const directClosedKeys = getDirectClosedKeys(floating, trail, index, isFloating);
  const removedKeys = resolveAllRemovedKeys(
    floating,
    trail,
    directClosedKeys,
    closePinnedDescendants,
    pinnedStates,
    dag,
  );

  return {
    isFloating,
    removedKeys,
  };
}
