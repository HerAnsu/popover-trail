/**
 * Graph Topology Metrics and Relationship Queries.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dag/dagMetrics
 */

import type { InternalDAGNode } from './dagTypes';

export function findRoots<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
): TPopoverKey[] {
  const roots: TPopoverKey[] = [];
  for (const [key, node] of nodes.entries()) {
    if (node.parentKeys.size === 0) roots.push(key);
  }
  return roots;
}

export function findLeaves<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
): TPopoverKey[] {
  const leaves: TPopoverKey[] = [];
  for (const [key, node] of nodes.entries()) {
    if (node.childrenKeys.size === 0) leaves.push(key);
  }
  return leaves;
}

export function computeMaxDepth<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
): number {
  let max = 0;
  for (const node of nodes.values()) {
    if (node.depth > max) max = node.depth;
  }
  return max;
}

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
