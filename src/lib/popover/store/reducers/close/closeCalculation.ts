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
 * Resolves both direct targets and transitive descendants via the DAG.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param floating - Active floating entries.
 * @param trail - Active cascading trail entries.
 * @param index - Target index to close from.
 * @param closePinnedDescendants - Whether to prune pinned children when their cascade parent closes.
 * @param pinnedStates - Current pinned state map.
 * @param dag - Optional DAG graph instance.
 * @returns Object with `isFloating` flag and `removedKeys` Set, or `null` if invalid index.
 *
 * @example
 * ```typescript
 * const result = getRemovedKeysForClose(floating, trail, 1, false, pinnedStates, dag);
 * ```
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
