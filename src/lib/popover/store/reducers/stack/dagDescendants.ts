/**
 * Directed Acyclic Graph (DAG) Breadth-First Descendant Traverser.
 *
 * @module store/reducers/stack/dagDescendants
 */

import type { PopoverDAG } from '../../../utils/dag';

/**
 * Enqueues unvisited child keys from the DAG node into the traversal queue.
 *
 * @example
 * ```ts
 * enqueueDagChildren(dag, 'parentCard', visitedSet, traversalQueue);
 * ```
 *
 * @template TPopoverKey - Valid popover key union.
 * @param dag - Directed acyclic graph instance.
 * @param current - Current popover key being inspected.
 * @param visited - Set of already visited popover keys.
 * @param queue - Queue to push unvisited child keys into.
 */
export function enqueueDagChildren<TPopoverKey extends string = string>(
  dag: PopoverDAG<TPopoverKey>,
  current: TPopoverKey,
  visited: ReadonlySet<TPopoverKey>,
  queue: { push(item: TPopoverKey): unknown },
): void {
  const node = dag.getNode(current);
  if (!node) return;

  for (const child of node.childrenKeys) {
    if (!visited.has(child)) {
      queue.push(child);
    }
  }
}
