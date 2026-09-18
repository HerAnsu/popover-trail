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
 * Reconstructs Directed Acyclic Graph (DAG) parent-child relationships from persisted trail and floating entries.
 * Clears existing topology and inserts nodes with their corresponding parent references in top-down topological order.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param dag - Target DAG instance to rebuild into.
 * @param trail - Active cascading trail entries.
 * @param floating - Pinned or detached floating entries.
 *
 * @example
 * ```typescript
 * restoreDAGFromState(dag, persistedState.trail, persistedState.floating);
 * ```
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
 * Executes a state mutation action, optionally delegating execution to a transition scheduler
 * (such as React 18/19 `startTransition` or a custom microtask scheduler).
 *
 * @param action - State mutation callback to execute.
 * @param scheduler - Optional transition scheduling runner.
 *
 * @example
 * ```typescript
 * executeWithTransition(() => store.setState({ count: 1 }), React.startTransition);
 * ```
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
