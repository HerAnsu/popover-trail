/**
 * Directed Acyclic Graph (DAG) Topology Helpers for Popover Trail.
 *
 * @module store/slices/trail/dagHelpers
 */

import type { TrailEntry } from '../../../types';
import type { PopoverDAG } from '../../../utils/dag';
import { EMPTY_ARRAY } from '../../storeDefaults';

/**
 * Collects a unique Set of all active keys from floating and trail collections.
 */
export function collectActiveKeySet<TData, TPopoverKey extends string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[] = EMPTY_ARRAY,
): Set<TPopoverKey> {
  const set = new Set<TPopoverKey>();
  for (const { key } of floating) set.add(key);
  for (const { key } of trail) set.add(key);
  return set;
}

/**
 * Zero-GC helper to prune DAG nodes directly from entry lists without intermediate array allocations.
 */
export function pruneDAGNodes<TData, TPopoverKey extends string = string>(
  dag: PopoverDAG<TPopoverKey> | undefined,
  entriesToPrune: readonly TrailEntry<TData, TPopoverKey>[],
  remainingFloating: readonly TrailEntry<TData, TPopoverKey>[],
  remainingTrail: readonly TrailEntry<TData, TPopoverKey>[] = EMPTY_ARRAY,
): void {
  if (!dag || entriesToPrune.length === 0) return;
  const activeKeys = collectActiveKeySet(remainingFloating, remainingTrail);
  for (const { key } of entriesToPrune) {
    if (!activeKeys.has(key)) dag.removeNode(key);
  }
}

/**
 * Prunes nodes beyond the target trail index in the cascade DAG without intermediate array allocations.
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
    const { key } = trail[i] ?? {};
    if (key && !activeKeys.has(key)) dag.removeNode(key);
  }
}
