/**
 * Graph Topology Metrics and Relationship Queries.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dag/dagMetrics
 */

import type { InternalDAGNode } from './dagTypes';

/**
 * Finds all root keys in the DAG (nodes with zero incoming parent edges).
 *
 * @template TPopoverKey - Key identifier type.
 * @param nodes - Internal DAG node dictionary.
 * @returns Array of root keys.
 *
 * @example
 * ```typescript
 * const roots = findRoots(dagNodes);
 * // => ['main-menu', 'notifications-anchor']
 * ```
 */
export function findRoots<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
): TPopoverKey[] {
  const roots: TPopoverKey[] = [];
  for (const [key, node] of nodes.entries()) {
    if (node.parentKeys.size === 0) roots.push(key);
  }
  return roots;
}

/**
 * Finds all leaf keys in the DAG (nodes with zero outgoing child edges).
 *
 * @template TPopoverKey - Key identifier type.
 * @param nodes - Internal DAG node dictionary.
 * @returns Array of leaf keys.
 *
 * @example
 * ```typescript
 * const leaves = findLeaves(dagNodes);
 * // => ['color-picker', 'confirm-modal']
 * ```
 */
export function findLeaves<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
): TPopoverKey[] {
  const leaves: TPopoverKey[] = [];
  for (const [key, node] of nodes.entries()) {
    if (node.childrenKeys.size === 0) leaves.push(key);
  }
  return leaves;
}

/**
 * Computes the maximum directed tree depth across all nodes in the DAG.
 *
 * @template TPopoverKey - Key identifier type.
 * @param nodes - Internal DAG node dictionary.
 * @returns Maximum depth integer (0 if empty or root-only).
 *
 * @example
 * ```typescript
 * const maxDepth = computeMaxDepth(dagNodes);
 * ```
 */
export function computeMaxDepth<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
): number {
  let max = 0;
  for (const node of nodes.values()) {
    if (node.depth > max) max = node.depth;
  }
  return max;
}

/**
 * Checks whether `childKey` is a transitive descendant of `ancestorKey`.
 * Uses iterative upward traversal with visited set to guard against cycles.
 *
 * @template TPopoverKey - Key identifier type.
 * @param nodes - Internal DAG node dictionary.
 * @param childKey - Proposed descendant key.
 * @param ancestorKey - Proposed ancestor key.
 * @returns True if `childKey` is an active descendant of `ancestorKey`.
 *
 * @example
 * ```typescript
 * if (isDescendantOf(dagNodes, 'sub-sub-item', 'root-menu')) {
 *   console.log('Cascade relationship confirmed');
 * }
 * ```
 */
export function isDescendantOf<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  childKey: TPopoverKey,
  ancestorKey: TPopoverKey,
): boolean {
  if (childKey === ancestorKey) return false;
  const visited = new Set<TPopoverKey>();
  const stack: TPopoverKey[] = [childKey];

  while (stack.length > 0) {
    const curr = stack.pop();
    if (!curr || visited.has(curr)) continue;
    visited.add(curr);

    const node = nodes.get(curr);
    if (!node) continue;

    for (const pKey of node.parentKeys) {
      if (pKey === ancestorKey) return true;
      if (!visited.has(pKey)) stack.push(pKey);
    }
  }
  return false;
}
