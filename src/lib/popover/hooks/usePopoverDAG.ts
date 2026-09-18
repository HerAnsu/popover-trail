/**
 * Reactive Hooks for Directed Acyclic Graph (DAG) Traversal and Edge Manipulation.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/usePopoverDAG
 */

import { useCallback, useMemo } from 'react';
import { usePopoverStore, usePopoverActions } from '../context/usePopoverStore';
import type { PopoverDAG } from '../utils/dag';
import { shallowEqualArray, areSetsEqual } from '../utils/equality';
import type { RegisteredKeys, RegisteredDataMap } from '../types/registerTypes';

export interface UsePopoverDAGResult<TPopoverKey extends string = RegisteredKeys> {
  /** Optional reference to the underlying directed acyclic graph instance. */
  readonly dag?: PopoverDAG<TPopoverKey>;
  /** Retrieves all direct parent keys of a popover. */
  readonly getParents: (key: TPopoverKey) => ReadonlySet<TPopoverKey>;
  /** Retrieves all direct child keys opened by a popover. */
  readonly getChildren: (key: TPopoverKey) => ReadonlySet<TPopoverKey>;
  /** Retrieves the ordered breadcrumb path from root anchor down to the target popover. */
  readonly getBreadcrumbs: (key: TPopoverKey) => readonly TPopoverKey[];
  /** Adds a directed cascade edge (parent -> child), returning false if it would create a cycle. */
  readonly addEdge: (parentKey: TPopoverKey, childKey: TPopoverKey) => boolean;
  /** Removes a directed cascade edge between parent and child. */
  readonly removeEdge: (parentKey: TPopoverKey, childKey: TPopoverKey) => void;
}

/**
 * Hook providing reactive access to the Directed Acyclic Graph (DAG) hierarchy and edge actions.
 *
 * @example
 * ```tsx
 * const { getBreadcrumbs, getChildren } = usePopoverDAG();
 * const breadcrumbs = getBreadcrumbs('settings-dialog');
 * ```
 */
export function usePopoverDAG<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
>(): UsePopoverDAGResult<TPopoverKey> {
  const actions = usePopoverActions<TData, TContext, TPopoverKey>();
  const { getDAG, getParents, getChildren, getBreadcrumbs, addEdge, removeEdge } = actions;
  const dag = getDAG();

  return useMemo(
    () => ({
      dag,
      getParents,
      getChildren,
      getBreadcrumbs,
      addEdge,
      removeEdge,
    }),
    [dag, getParents, getChildren, getBreadcrumbs, addEdge, removeEdge],
  );
}

/**
 * Hook returning the ordered breadcrumb path from the root anchor to the specified popover key.
 *
 * @example
 * ```tsx
 * const trailPath = useBreadcrumbPath('subitem-card');
 * // ['root', 'item-card', 'subitem-card']
 * ```
 *
 * @param key - Identifier of the target popover.
 * @returns Readonly array of keys from root to target.
 */
export function useBreadcrumbPath<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
>(key: TPopoverKey): readonly TPopoverKey[] {
  const { getBreadcrumbs } = usePopoverActions<TData, TContext, TPopoverKey>();
  return usePopoverStore<readonly TPopoverKey[], TData, TContext, TPopoverKey>(
    useCallback(
      ({ trail, floating }) => {
        void trail;
        void floating;
        return getBreadcrumbs(key);
      },
      [getBreadcrumbs, key],
    ),
    shallowEqualArray,
  );
}

/**
 * Hook returning a reactive set of all direct parent keys that opened or point to the target popover.
 *
 * Uses set equality (`areSetsEqual`) to prevent unnecessary component re-renders
 * when the parent graph structure has not changed.
 *
 * @param key - Target popover key identifier.
 * @returns Readonly set of parent popover keys.
 *
 * @example
 * ```tsx
 * function SubMenuIndicator({ menuId }: { menuId: string }) {
 *   const parents = usePopoverParents(menuId);
 *   return <span>Opened by {parents.size} ancestor(s)</span>;
 * }
 * ```
 */
export function usePopoverParents<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
>(key: TPopoverKey): ReadonlySet<TPopoverKey> {
  const { getParents } = usePopoverActions<TData, TContext, TPopoverKey>();
  return usePopoverStore<ReadonlySet<TPopoverKey>, TData, TContext, TPopoverKey>(
    useCallback(
      ({ trail, floating }) => {
        void trail;
        void floating;
        return getParents(key);
      },
      [getParents, key],
    ),
    areSetsEqual,
  );
}

/**
 * Hook returning a reactive set of all direct child keys opened from the target popover.
 *
 * Uses set equality (`areSetsEqual`) to eliminate redundant re-renders when child
 * nodes are added or removed.
 *
 * @param key - Target popover key identifier.
 * @returns Readonly set of child popover keys.
 *
 * @example
 * ```tsx
 * function ParentCard({ cardId }: { cardId: string }) {
 *   const children = usePopoverChildren(cardId);
 *   const hasActiveChildren = children.size > 0;
 *
 *   return (
 *     <div className={hasActiveChildren ? 'card-expanded' : 'card-leaf'}>
 *       Card Body
 *     </div>
 *   );
 * }
 * ```
 */
export function usePopoverChildren<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
>(key: TPopoverKey): ReadonlySet<TPopoverKey> {
  const { getChildren } = usePopoverActions<TData, TContext, TPopoverKey>();
  return usePopoverStore<ReadonlySet<TPopoverKey>, TData, TContext, TPopoverKey>(
    useCallback(
      ({ trail, floating }) => {
        void trail;
        void floating;
        return getChildren(key);
      },
      [getChildren, key],
    ),
    areSetsEqual,
  );
}
