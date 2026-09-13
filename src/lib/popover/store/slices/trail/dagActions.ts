/**
 * DAG Edge and Hierarchy Actions for Popover Trail.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/slices/trail/dagActions
 */

import type { TrailSliceActions, TrailEntry } from '../../../types';
import type { SliceContext } from '../context';
import type { PopoverDAG } from '../../../utils/dag';
import { EMPTY_ARRAY, EMPTY_SET } from '../../../constants';


export type TrailDAGActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Pick<
  TrailSliceActions<TData, TContext, TPopoverKey>,
  'addEdge' | 'removeEdge' | 'getParents' | 'getChildren' | 'getGeodesicPath' | 'getDAG'
>;

function updateEntryParents<TData, TPopoverKey extends string>(
  entries: readonly TrailEntry<TData, TPopoverKey>[],
  targetKey: TPopoverKey,
  parents: ReadonlySet<TPopoverKey>,
): readonly TrailEntry<TData, TPopoverKey>[] {
  return entries.map((entry) => {
    if (entry.key !== targetKey) return entry;
    const parentKey = parents.values().next().value;
    return { ...entry, parentKeys: parents, parentKey };
  });
}

export function createTrailDAGActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(ctx: SliceContext<TData, TContext, TPopoverKey>): TrailDAGActions<TData, TContext, TPopoverKey> {
  const { set, deps } = ctx;
  const { popoverDAG, dispatchEffects } = deps;

  return {
    addEdge: (parentKey: TPopoverKey, childKey: TPopoverKey): boolean => {
      if (!popoverDAG) return false;
      const success = popoverDAG.addEdge(parentKey, childKey);
      if (!success) return false;

      const parents = popoverDAG.getParents(childKey);
      set((state) => ({
        trail: updateEntryParents(state.trail, childKey, parents),
        floating: updateEntryParents(state.floating, childKey, parents),
      }));

      dispatchEffects([
        { type: 'EMIT_EVENT', event: { type: 'dag_edge_added', parentKey, childKey } },
      ]);
      return true;
    },

    removeEdge: (parentKey: TPopoverKey, childKey: TPopoverKey): void => {
      if (!popoverDAG) return;
      popoverDAG.removeEdge(parentKey, childKey);

      const parents = popoverDAG.getParents(childKey);
      set((state) => ({
        trail: updateEntryParents(state.trail, childKey, parents),
        floating: updateEntryParents(state.floating, childKey, parents),
      }));

      dispatchEffects([
        { type: 'EMIT_EVENT', event: { type: 'dag_edge_removed', parentKey, childKey } },
      ]);
    },

    getParents: (key: TPopoverKey): ReadonlySet<TPopoverKey> =>
      popoverDAG?.getParents(key) ?? EMPTY_SET,

    getChildren: (key: TPopoverKey): ReadonlySet<TPopoverKey> =>
      popoverDAG?.getChildren(key) ?? EMPTY_SET,

    getGeodesicPath: (key: TPopoverKey): readonly TPopoverKey[] =>
      popoverDAG?.getGeodesicPath(key) ?? EMPTY_ARRAY,


    getDAG: (): PopoverDAG<TPopoverKey> | undefined => popoverDAG,
  };
}
