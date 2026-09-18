/**
 * Descendant and Target Closed Keys Resolver Engine.
 *
 * @module store/reducers/close/closeKeys
 */

import type { TrailEntry } from '../../../types';
import type { PopoverDAG } from '../../../utils/dag';
import { getAllDescendants } from '../stack';
import { shouldIncludeDescendant } from './closeHierarchy';
import { prop } from '../../../utils/functional';

import { isDisjoint } from '../../../utils/setOperations';

/**
 * Resolves the complete set of direct target keys and transitive descendant keys to remove for a close operation.
 * Utilizes the Directed Acyclic Graph (DAG) when available to guarantee that no orphan child nodes remain.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param floating - Active floating cards.
 * @param trail - Active cascading trail cards.
 * @param directClosedKeys - Direct keys being closed.
 * @param closePinnedDescendants - Whether pinned cards should be included in closure.
 * @param pinnedStates - Current pinned state map.
 * @param dag - Optional DAG graph instance.
 * @returns Set of all popover keys to remove.
 *
 * @example
 * ```typescript
 * const keysToRemove = resolveAllRemovedKeys(floating, trail, ['root'], false, pinnedStates, dag);
 * ```
 */
export function resolveAllRemovedKeys<TData = unknown, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  directClosedKeys: readonly TPopoverKey[],
  closePinnedDescendants: boolean,
  pinnedStates?: Readonly<Partial<Record<TPopoverKey, boolean>>>,
  dag?: PopoverDAG<TPopoverKey>,
): Set<TPopoverKey> {
  const result = new Set<TPopoverKey>(directClosedKeys);
  const descendants = getAllDescendants<TData, TPopoverKey>(
    directClosedKeys,
    floating,
    trail,
    closePinnedDescendants,
    dag,
  );

  if (descendants.size === 0) return result;

  const floatingSet =
    !closePinnedDescendants && !pinnedStates && floating.length > 0
      ? new Set<TPopoverKey>(floating.map(prop('key')))
      : undefined;

  if (floatingSet && isDisjoint(descendants, floatingSet)) {
    for (const key of descendants) {
      result.add(key);
    }
    return result;
  }

  for (const key of descendants) {
    if (shouldIncludeDescendant(key, closePinnedDescendants, pinnedStates, floatingSet)) {
      result.add(key);
    }
  }

  return result;
}
