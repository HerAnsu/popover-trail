/**
 * Hierarchy, Breadcrumb, and Graph Branch Selectors.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module storeHierarchySelectors
 */

import type { TrailEntry } from '../../types';
import { EMPTY_ARRAY } from '../hydration';
import { hasKeyIn } from '../../utils/predicates';
import { concatImmutable } from '../../utils/arrayUtils';
import { setUnion } from '../../utils/setOperations';
import type { HasActiveEntriesState } from './storeSelectorTypes';


/**
 * Traverses floating and trail popovers to collect all child keys directly opened by `key`.
 *
 * @param floating - Readonly array of floating/pinned entries.
 * @param trail - Readonly array of active cascading trail entries.
 * @param key - Identifier of the parent popover.
 * @returns Readonly array of direct child popover keys, or an empty frozen array.
 */
export function collectChildrenKeys<TPopoverKey extends string = string, TData = unknown>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): readonly TPopoverKey[] {
  const children: TPopoverKey[] = [];
  const isChild = (e: TrailEntry<TData, TPopoverKey>): boolean =>
    e.parentKey === key || e.originalParentKey === key;
  for (const e of floating) if (isChild(e)) children.push(e.key);
  for (const e of trail) if (isChild(e)) children.push(e.key);
  return children.length > 0 ? children : EMPTY_ARRAY;
}

/**
 * Higher-order selector returning all direct child keys of a popover.
 *
 * @param key - Identifier of the parent popover.
 * @returns Selector function mapping store state to child keys array.
 */
export const selectChildrenKeys =
  <TPopoverKey extends string = string, TData = unknown>(key: string) =>
  (state: HasActiveEntriesState<TData, TPopoverKey>): readonly TPopoverKey[] =>
    collectChildrenKeys<TPopoverKey, TData>(state.floating, state.trail, key);

/**
 * Builds a fast Map index pairing keys with their corresponding `TrailEntry`.
 *
 * @param floating - Readonly array of floating/pinned entries.
 * @param trail - Readonly array of active cascading trail entries.
 * @returns Map index for O(1) entry lookup.
 */
export function buildEntryIndex<TData, TPopoverKey extends string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
): Map<string, TrailEntry<TData, TPopoverKey>> {
  const index = new Map<string, TrailEntry<TData, TPopoverKey>>();
  for (const e of trail) index.set(e.key, e);
  for (const e of floating) index.set(e.key, e);
  return index;
}

/**
 * Backtracks via parent pointers to construct the breadcrumb trail path from root to the target popover.
 *
 * @param floating - Readonly array of floating/pinned entries.
 * @param trail - Readonly array of active cascading trail entries.
 * @param key - Target popover key.
 * @returns Array of keys in root-to-target order.
 */
export function buildBreadcrumbPath<TPopoverKey extends string = string, TData = unknown>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): readonly TPopoverKey[] {
  const path: TPopoverKey[] = [];
  let currentKey: string | undefined = key;
  const visited = new Set<string>();
  const index = buildEntryIndex<TData, TPopoverKey>(floating, trail);
  while (currentKey && !visited.has(currentKey)) {
    visited.add(currentKey);
    const entry = index.get(currentKey);
    if (!entry) break;
    path.push(entry.key);
    currentKey = entry.parentKey ?? entry.originalParentKey;
  }
  return path.length > 0 ? path.toReversed() : EMPTY_ARRAY;
}

/**
 * Higher-order selector returning the breadcrumb keys from root down to the target popover.
 *
 * @param key - Target popover key.
 * @returns Selector mapping state to breadcrumb keys array.
 */
export const selectBreadcrumbs =
  <TPopoverKey extends string = string, TData = unknown>(key: string) =>
  (state: HasActiveEntriesState<TData, TPopoverKey>): readonly TPopoverKey[] =>
    buildBreadcrumbPath<TPopoverKey, TData>(state.floating, state.trail, key);

/**
 * Higher-order selector calculating the integer nesting depth of a popover (0 = root).
 *
 * @param key - Target popover key.
 * @returns Selector mapping state to integer depth.
 */
export function selectPopoverDepth<TPopoverKey extends string = string, TData = unknown>(
  key: string,
) {
  return (state: HasActiveEntriesState<TData, TPopoverKey>): number => {
    let depth = 0;
    let currentKey: string | undefined = key;
    const visited = new Set<string>();
    const index = buildEntryIndex<TData, TPopoverKey>(state.floating, state.trail);
    while (currentKey && !visited.has(currentKey)) {
      visited.add(currentKey);
      const entry = index.get(currentKey);
      const parentKey = entry?.parentKey ?? entry?.originalParentKey;
      if (!parentKey) break;
      depth++;
      currentKey = parentKey;
    }
    return depth;
  };
}

function collectBranchMatches<TPopoverKey extends string = string, TData = unknown>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  keys: ReadonlySet<string>,
): readonly TrailEntry<TData, TPopoverKey>[] {
  const inKeys = hasKeyIn<TrailEntry<TData, TPopoverKey>>(keys);
  return concatImmutable(floating.filter(inKeys), trail.filter(inKeys));
}

/**
 * Higher-order selector returning all active entries along the branch (ancestor path + direct children).
 *
 * @param key - Focus popover key.
 * @returns Selector mapping state to array of TrailEntry items.
 */
export function selectTrailBranch<TPopoverKey extends string = string, TData = unknown>(
  key: string,
) {
  return (
    state: HasActiveEntriesState<TData, TPopoverKey>,
  ): readonly TrailEntry<TData, TPopoverKey>[] => {
    const breadcrumbs = buildBreadcrumbPath<TPopoverKey, TData>(state.floating, state.trail, key);
    const children = collectChildrenKeys<TPopoverKey, TData>(state.floating, state.trail, key);
    const keys = setUnion(new Set(breadcrumbs), new Set(children));
    return collectBranchMatches<TPopoverKey, TData>(state.floating, state.trail, keys);
  };
}


