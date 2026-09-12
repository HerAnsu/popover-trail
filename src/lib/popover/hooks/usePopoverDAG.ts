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
  readonly dag?: PopoverDAG<TPopoverKey>;
  readonly getParents: (key: TPopoverKey) => ReadonlySet<TPopoverKey>;
  readonly getChildren: (key: TPopoverKey) => ReadonlySet<TPopoverKey>;
  readonly getGeodesicPath: (key: TPopoverKey) => readonly TPopoverKey[];
  readonly addEdge: (parentKey: TPopoverKey, childKey: TPopoverKey) => boolean;
  readonly removeEdge: (parentKey: TPopoverKey, childKey: TPopoverKey) => void;
}

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
      getGeodesicPath: actions.getGeodesicPath,
      addEdge: actions.addEdge,
      removeEdge: actions.removeEdge,
    }),
    [dag, actions],
  );
}

export function useGeodesicPath<
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
        return actions.getGeodesicPath(key);
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
