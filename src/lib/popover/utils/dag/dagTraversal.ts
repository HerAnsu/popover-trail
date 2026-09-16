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
 * Collects all descendant keys of a parent node into a target Set.
 *
 * @param nodes - Kernel DAG node dictionary.
 * @param parentKey - Starting parent key.
 * @param outSet - Mutable set into which descendant keys are inserted.
 * @returns The populated `outSet`.
 */
export function traverseDescendantKeys<TPopoverKey extends string>(
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
 * Collects all ancestor keys above a target node up to the root anchors.
 *
 * @param nodes - Kernel DAG node dictionary.
 * @param childKey - Starting target child key.
 * @param outSet - Mutable set to collect ancestor keys into (defaults to new Set).
 * @returns The populated `outSet` containing all ancestor keys.
 */
export function traverseAncestorKeys<TPopoverKey extends string>(
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
 * const breadcrumbs = getGeodesicPath(dagNodes, 'nestedMenuSubitem');
 * // => ['rootMenu', 'subMenu', 'nestedMenuSubitem']
 * ```
 *
 * @param nodes - Kernel DAG node dictionary.
 * @param targetKey - Leaf or target popover key.
 * @returns Array of keys tracing the path from root to target, or empty array if target not in DAG.
 */
export function getGeodesicPath<TPopoverKey extends string>(
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

/**
 * Returns the path from the root anchor down to the target popover.
 * Alias for {@link getGeodesicPath}.
 */
export const getPathFromRoot = getGeodesicPath;

/**
 * Returns the breadcrumb trail from the root anchor down to the target popover.
 * Alias for {@link getGeodesicPath}.
 */
export const getBreadcrumbs = getGeodesicPath;

/**
 * Returns the path from root to target popover.
 * Alias for {@link getGeodesicPath}.
 */
export const getPathToRoot = getGeodesicPath;
