/**
 * Topological DAG Traversal, Streaming Visitors, and Geodesic Paths.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dag/dagTraversal
 */

import { RingBuffer } from '../buffer';
import type { InternalDAGNode } from './dagTypes';

/**
 * Iteratively traverses all descendant keys of a parent node in depth-first order.
 *
 * @remarks
 * Uses an explicit array stack to prevent call-stack overflows on deep hierarchies.
 * Traversal terminates early if `visitor` returns `false`.
 *
 * @param nodes - Kernel DAG node dictionary.
 * @param parentKey - Starting root key of the cascade branch.
 * @param visitor - Callback invoked for each visited descendant key. Return `false` to abort early.
 * @param visited - Optional set tracking visited keys to guard against cycles.
 * @returns `false` if stopped early by the visitor callback, `true` otherwise.
 */
export function visitDescendants<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  parentKey: TPopoverKey,
  visitor: (key: TPopoverKey) => boolean | void,
  visited: Set<TPopoverKey> = new Set<TPopoverKey>(),
): boolean {
  const stack: TPopoverKey[] = [parentKey];
  while (stack.length > 0) {
    const currentKey = stack.pop();
    if (!currentKey) continue;
    const node = nodes.get(currentKey);
    if (!node) continue;

    for (const childKey of node.childrenKeys) {
      if (!visited.has(childKey) && childKey !== parentKey) {
        visited.add(childKey);
        if (visitor(childKey) === false) return false;
        stack.push(childKey);
      }
    }
  }
  return true;
}

/**
 * Collects all reachable descendant keys of a parent node into a target Set.
 *
 * Traverses downward using depth-first search, adding all reachable keys into `outSet`.
 *
 * @template TPopoverKey - Node key identifier type.
 * @param nodes - Kernel DAG node dictionary.
 * @param parentKey - Starting parent key.
 * @param outSet - Mutable set into which descendant keys are inserted.
 * @returns The populated `outSet`.
 *
 * @example
 * ```typescript
 * const descendants = collectDescendants(dagNodes, 'main-menu', new Set());
 * console.log('Descendants count:', descendants.size);
 * ```
 */
export function collectDescendants<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  parentKey: TPopoverKey,
  outSet: Set<TPopoverKey>,
): Set<TPopoverKey> {
  visitDescendants(
    nodes,
    parentKey,
    (key) => {
      outSet.add(key);
    },
    outSet,
  );
  return outSet;
}

/**
 * Collects all reachable ancestor keys above a target child node up to root anchors.
 *
 * Traverses upward using depth-first search, adding all reachable ancestor keys into `outSet`.
 *
 * @template TPopoverKey - Node key identifier type.
 * @param nodes - Kernel DAG node dictionary.
 * @param childKey - Starting target child key.
 * @param outSet - Mutable set to collect ancestor keys into (defaults to new Set).
 * @returns The populated `outSet` containing all ancestor keys.
 *
 * @example
 * ```typescript
 * const ancestors = collectAncestors(dagNodes, 'flyout-submenu');
 * if (ancestors.has('main-menu')) {
 *   console.log('main-menu is an ancestor of flyout-submenu');
 * }
 * ```
 */
export function collectAncestors<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  childKey: TPopoverKey,
  outSet: Set<TPopoverKey> = new Set<TPopoverKey>(),
): Set<TPopoverKey> {
  const stack: TPopoverKey[] = [childKey];
  while (stack.length > 0) {
    const currentKey = stack.pop();
    if (!currentKey) continue;
    const node = nodes.get(currentKey);
    if (!node) continue;

    for (const pKey of node.parentKeys) {
      if (!outSet.has(pKey) && pKey !== childKey) {
        outSet.add(pKey);
        stack.push(pKey);
      }
    }
  }
  return outSet;
}

/**
 * Computes the unique breadcrumb trail path from the root anchor down to the target popover.
 *
 * @remarks
 * Backtracks via `parentKey` pointers until reaching a root node without a parent.
 * Returns an array ordered from root ancestor to target: `[root, intermediate, ..., target]`.
 *
 * @example
 * ```ts
 * const breadcrumbs = getBreadcrumbs(dagNodes, 'nestedMenuSubitem');
 * // => ['rootMenu', 'subMenu', 'nestedMenuSubitem']
 * ```
 *
 * @param nodes - Kernel DAG node dictionary.
 * @param targetKey - Leaf or target popover key.
 * @returns Array of keys tracing the path from root to target, or empty array if target not in DAG.
 */
export function getBreadcrumbs<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  targetKey: TPopoverKey,
): TPopoverKey[] {
  if (!nodes.has(targetKey)) return [];
  const path = new RingBuffer<TPopoverKey>({
    capacity: 16,
    autoExpand: true,
    initialItems: [targetKey],
  });
  let curr = nodes.get(targetKey);

  while (curr && curr.parentKey) {
    const nextKey = curr.parentKey;
    if (path.includes(nextKey)) break;
    path.unshift(nextKey);
    curr = nodes.get(nextKey);
  }
  return path.toArray();
}
