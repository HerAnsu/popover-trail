/**
 * Hierarchy Navigation and Filtering for Popover Close Operations.
 *
 * @module store/reducers/close/closeHierarchy
 */

import type { TrailEntry } from '../../../types';
import { drop } from '../../../utils/arrayUtils';
import { prop } from '../../../utils/functional';
import { unique } from '../../../utils/collections';

/**
 * Collects direct keys to close from the target index without allocating unnecessary intermediate arrays.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param floating - Active floating cards.
 * @param trail - Active cascading trail cards.
 * @param index - Index in unified stack.
 * @param isFloating - Whether index falls within the floating range.
 * @returns Array of primary keys targeted for closure.
 *
 * @example
 * ```typescript
 * const keys = getDirectClosedKeys(floating, trail, 2, false);
 * ```
 */
export function getDirectClosedKeys<TData = unknown, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  index: number,
  isFloating: boolean,
): TPopoverKey[] {
  if (isFloating) {
    const entry = floating[index];
    return entry ? [entry.key] : [];
  }
  const trailIndex = index - floating.length;
  return [...unique(drop(trail, trailIndex).map(prop('key')))];
}

/**
 * Evaluates whether a descendant card should be included in the closure set, respecting pinning rules.
 *
 * @template TPopoverKey - Registered string key identifiers.
 * @param key - Candidate descendant key.
 * @param closePinnedDescendants - Whether pinned cards are closed when parents close.
 * @param pinnedStates - Current pinned state map.
 * @param floatingSet - Set of currently floating keys.
 * @returns `true` if descendant should be closed.
 *
 * @example
 * ```typescript
 * const closeIt = shouldIncludeDescendant('child-1', false, pinnedStates);
 * ```
 */
export function shouldIncludeDescendant<TPopoverKey extends string = string>(
  key: TPopoverKey,
  closePinnedDescendants: boolean,
  pinnedStates?: Readonly<Partial<Record<TPopoverKey, boolean>>>,
  floatingSet?: ReadonlySet<TPopoverKey>,
): boolean {
  if (closePinnedDescendants) return true;
  if (pinnedStates) return !pinnedStates[key];
  if (floatingSet) return !floatingSet.has(key);
  return true;
}
