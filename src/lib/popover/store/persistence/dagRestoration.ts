/**
 * DAG Topological Structure Restoration for Popover Persistence.
 *
 * @module store/persistence/dagRestoration
 */

import type { TrailEntry } from '../../types';
import type { PopoverDAG } from '../../utils/dag';

export interface DAGRestorationTarget<TPopoverKey extends string = string> {
  clear: () => void;
  addNode: (k: TPopoverKey, p?: TPopoverKey) => void;
}

function insertEntriesIntoDAG<TData, TPopoverKey extends string = string>(
  dag: PopoverDAG<TPopoverKey> | DAGRestorationTarget<TPopoverKey>,
  entries: readonly TrailEntry<TData, TPopoverKey>[],
  visited: Set<TPopoverKey>,
): void {
  for (const e of entries) {
    if (!e || visited.has(e.key)) continue;
    visited.add(e.key);
    const parent = e.parentKey ?? e.originalParentKey;
    dag.addNode(e.key, parent);
  }
}

/**
 * Restores Directed Acyclic Graph relationships from persisted trail and floating entries.
 */
export function restoreDAGFromState<TData, TPopoverKey extends string = string>(
  dag: PopoverDAG<TPopoverKey> | DAGRestorationTarget<TPopoverKey> | undefined,
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  floating: readonly TrailEntry<TData, TPopoverKey>[] = [],
): void {
  if (!dag) return;
  dag.clear();

  const visited = new Set<TPopoverKey>();
  insertEntriesIntoDAG(dag, trail, visited);
  insertEntriesIntoDAG(dag, floating, visited);
}

/**
 * Executes a state mutation optionally wrapped in a transition scheduler.
 */
export function executeWithTransition(
  action: () => void,
  scheduler?: (callback: () => void) => void,
): void {
  if (scheduler) {
    scheduler(action);
  } else {
    action();
  }
}
