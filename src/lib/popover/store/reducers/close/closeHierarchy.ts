/**
 * Hierarchy Navigation and Filtering for Popover Close Operations.
 *
 * @module store/reducers/close/closeHierarchy
 */

import type { TrailEntry } from '../../../types';

/**
 * Collects direct keys to close from target index without intermediate array overhead.
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
  const result: TPopoverKey[] = [];
  for (let i = trailIndex; i < trail.length; i++) {
    const entry = trail[i];
    if (entry) result.push(entry.key);
  }
  return result;
}

/**
 * Evaluates whether a descendant card should be closed according to pinning configuration.
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
