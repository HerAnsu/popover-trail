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
  const dag = actions.getDAG();

  return useMemo(
    () => ({
      dag,
      getParents: actions.getParents,
      getChildren: actions.getChildren,
      getBreadcrumbs: actions.getBreadcrumbs,
      addEdge: actions.addEdge,
      removeEdge: actions.removeEdge,
    }),
    [dag, actions],
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
  const actions = usePopoverActions<TData, TContext, TPopoverKey>();
  return usePopoverStore<readonly TPopoverKey[], TData, TContext, TPopoverKey>(
    useCallback(
      (s) => {
        void s.trail;
        void s.floating;
        return actions.getBreadcrumbs(key);
      },
      [actions, key],
    ),
    shallowEqualArray,
  );
}

export function usePopoverParents<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
>(key: TPopoverKey): ReadonlySet<TPopoverKey> {
  const actions = usePopoverActions<TData, TContext, TPopoverKey>();
  return usePopoverStore<ReadonlySet<TPopoverKey>, TData, TContext, TPopoverKey>(
    useCallback(
      (s) => {
        void s.trail;
        void s.floating;
        return actions.getParents(key);
      },
      [actions, key],
    ),
    areSetsEqual,
  );
}

export function usePopoverChildren<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
>(key: TPopoverKey): ReadonlySet<TPopoverKey> {
  const actions = usePopoverActions<TData, TContext, TPopoverKey>();
  return usePopoverStore<ReadonlySet<TPopoverKey>, TData, TContext, TPopoverKey>(
    useCallback(
      (s) => {
        void s.trail;
        void s.floating;
        return actions.getChildren(key);
      },
      [actions, key],
    ),
    areSetsEqual,
  );
}
