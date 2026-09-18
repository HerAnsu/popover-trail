/**
 * Directed Acyclic Graph (DAG) Topology Helpers for Popover Trail.
 *
 * @module store/slices/trail/dagHelpers
 */

import type { TrailEntry } from '../../../types';
import type { PopoverDAG } from '../../../utils/dag';
import { EMPTY_ARRAY } from '../../storeDefaults';
import { getActiveKeys } from '../../reducers/stack/recordFilter';
import { setDifference } from '../../../utils/setOperations';
import { prop } from '../../../utils/functional';

export { getActiveKeys };

/**
 * Zero-GC helper to prune DAG nodes directly from entry lists without intermediate array allocations.
 *
 * @example
 * ```ts
 * pruneDAGNodes(dag, entriesToPrune, remainingFloating, remainingTrail);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param dag - Popover DAG instance.
 * @param entriesToPrune - List of entries that were removed or candidate for pruning.
 * @param remainingFloating - Surviving floating entries.
 * @param remainingTrail - Surviving active trail entries.
 */
export function pruneDAGNodes<TData, TPopoverKey extends string = string>(
  dag: PopoverDAG<TPopoverKey> | undefined,
  entriesToPrune: readonly TrailEntry<TData, TPopoverKey>[],
  remainingFloating: readonly TrailEntry<TData, TPopoverKey>[],
  remainingTrail: readonly TrailEntry<TData, TPopoverKey>[] = EMPTY_ARRAY,
): void {
  if (!dag || entriesToPrune.length === 0) return;
  const activeKeys = getActiveKeys(remainingFloating, remainingTrail);
  const candidateKeys = new Set<TPopoverKey>(entriesToPrune.map(prop('key')));
  const pruneKeys = setDifference(candidateKeys, activeKeys);
  for (const key of pruneKeys) {
    dag.removeNode(key);
  }
}

/**
 * Prunes nodes beyond the target trail index in the cascade DAG without intermediate array allocations.
 *
 * @example
 * ```ts
 * pruneTruncatedTrailNodes(dag, floating, trail, 2);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param dag - Popover DAG instance.
 * @param floating - Active floating entries.
 * @param trail - Active cascading trail entries.
 * @param trailIdx - Truncation boundary index in trail.
 */
export function pruneTruncatedTrailNodes<TData, TPopoverKey extends string>(
  dag: PopoverDAG<TPopoverKey> | undefined,
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  trailIdx: number,
): void {
  if (trailIdx < 0 || trailIdx >= trail.length - 1 || !dag) return;
  const activeKeys = new Set<TPopoverKey>();
  for (const { key } of floating) activeKeys.add(key);
  for (let i = 0; i <= trailIdx; i++) {
    const entry = trail[i];
    if (entry) activeKeys.add(entry.key);
  }
  for (let i = trailIdx + 1; i < trail.length; i++) {
    const entry = trail[i];
    if (entry && !activeKeys.has(entry.key)) dag.removeNode(entry.key);
  }
}
