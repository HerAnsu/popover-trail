/**
 * Descendant and Target Closed Keys Resolver Engine.
 *
 * @module store/reducers/close/closeKeys
 */

import type { TrailEntry } from '../../../types';
import type { PopoverDAG } from '../../../utils/dag';
import { getAllDescendants } from '../stack';
import { shouldIncludeDescendant } from './closeHierarchy';

function createFloatingKeySet<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
): Set<TPopoverKey> {
  const set = new Set<TPopoverKey>();
  for (const entry of floating) {
    if (entry) set.add(entry.key);
  }
  return set;
}

/**
 * Resolves all direct and transitive descendant keys to remove for a close operation.
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
      ? createFloatingKeySet(floating)
      : undefined;

  for (const key of descendants) {
    if (shouldIncludeDescendant(key, closePinnedDescendants, pinnedStates, floatingSet)) {
      result.add(key);
    }
  }

  return result;
}
