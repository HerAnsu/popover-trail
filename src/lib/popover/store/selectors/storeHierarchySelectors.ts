/**
 * Hierarchy, Breadcrumb, and Graph Branch Selectors.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module storeHierarchySelectors
 */

import type { TrailEntry } from '../../types';
import { EMPTY_ARRAY } from '../hydration';
import type { HasActiveEntriesState } from './storeSelectorTypes';

export function collectChildrenKeys<TPopoverKey extends string = string, TData = unknown>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): readonly TPopoverKey[] {
  const children: TPopoverKey[] = [];
  const isChild = (e: TrailEntry<TData, TPopoverKey>) =>
    e.parentKey === key || e.originalParentKey === key;
  for (const e of floating) if (isChild(e)) children.push(e.key);
  for (const e of trail) if (isChild(e)) children.push(e.key);
  return children.length > 0 ? children : EMPTY_ARRAY;
}

export const selectChildrenKeys = <TPopoverKey extends string = string, TData = unknown>(key: string) =>
  (state: HasActiveEntriesState<TData, TPopoverKey>): readonly TPopoverKey[] =>
    collectChildrenKeys<TPopoverKey, TData>(state.floating, state.trail, key);

export function buildEntryIndex<TData, TPopoverKey extends string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
): Map<string, TrailEntry<TData, TPopoverKey>> {
  const index = new Map<string, TrailEntry<TData, TPopoverKey>>();
  for (const e of trail) index.set(e.key, e);
  for (const e of floating) index.set(e.key, e);
  return index;
}

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

export const selectBreadcrumbs = <TPopoverKey extends string = string, TData = unknown>(key: string) =>
  (state: HasActiveEntriesState<TData, TPopoverKey>): readonly TPopoverKey[] =>
    buildBreadcrumbPath<TPopoverKey, TData>(state.floating, state.trail, key);

export function selectPopoverDepth<TPopoverKey extends string = string, TData = unknown>(key: string) {
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

export function selectTrailBranch<TPopoverKey extends string = string, TData = unknown>(key: string) {
  return (state: HasActiveEntriesState<TData, TPopoverKey>): readonly TrailEntry<TData, TPopoverKey>[] => {
    const keys = new Set([
      ...buildBreadcrumbPath<TPopoverKey, TData>(state.floating, state.trail, key),
      ...collectChildrenKeys<TPopoverKey, TData>(state.floating, state.trail, key),
    ]);
    const matches = [...state.floating, ...state.trail].filter((e) => keys.has(e.key));
    return matches.length > 0 ? matches : EMPTY_ARRAY;
  };
}
