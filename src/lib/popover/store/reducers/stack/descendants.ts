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
