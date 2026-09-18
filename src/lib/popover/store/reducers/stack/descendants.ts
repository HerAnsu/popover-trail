/**
 * Graph Traversal and Topological Descendant Collection Engine.
 *
 * @module store/reducers/stack/descendants
 */

import type { TrailEntry } from '../../../types';
import type { PopoverDAG } from '../../../utils/dag';
import { RingBuffer } from '../../../utils/buffer';
import { enqueueDagChildren } from './dagDescendants';
import { enqueueListChildren } from './listDescendants';

/**
 * Traverses all reachable descendants for a set of target root keys using BFS.
 *
 * @example
 * ```ts
 * const children = getAllDescendants(['root-1'], floating, trail, true, dag);
 * console.log([...children]);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Valid popover key union.
 * @param directClosedKeys - Array of starting keys whose descendants should be found.
 * @param floating - Readonly array of floating pinned entries.
 * @param trail - Readonly array of active cascading trail entries.
 * @param closePinnedDescendants - Whether pinned cards with parent references should also be gathered.
 * @param dag - Optional directed acyclic graph for topological parent-child lookups.
 * @returns Set of descendant keys excluding the direct root keys.
 */
export function getAllDescendants<TData = unknown, TPopoverKey extends string = string>(
  directClosedKeys: readonly TPopoverKey[],
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  closePinnedDescendants: boolean,
  dag?: PopoverDAG<TPopoverKey>,
): Set<TPopoverKey> {
  const visited = new Set<TPopoverKey>();
  const queue = new RingBuffer<TPopoverKey>({
    capacity: Math.max(16, directClosedKeys.length),
    autoExpand: true,
    initialItems: directClosedKeys,
  });

  while (!queue.isEmpty) {
    const current = queue.shift();
    if (!current || visited.has(current)) continue;

    visited.add(current);

    if (dag) {
      enqueueDagChildren(dag, current, visited, queue);
    } else {
      enqueueListChildren(floating, trail, current, closePinnedDescendants, visited, queue);
    }
  }

  for (const key of directClosedKeys) {
    visited.delete(key);
  }

  return visited;
}
