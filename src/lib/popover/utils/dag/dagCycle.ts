/**
 * Cycle Detection and Resolution for Multi-Parent DAGs.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dag/dagCycle
 */

import type { InternalDAGNode } from './dagTypes';

export function isReachableAncestor<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  startKey: TPopoverKey,
  targetAncestorKey: TPopoverKey,
): boolean {
  if (startKey === targetAncestorKey) return true;
  const visited = new Set<TPopoverKey>();
  const stack: TPopoverKey[] = [startKey];

  while (stack.length > 0) {
    const curr = stack.pop();
    if (!curr || visited.has(curr)) continue;
    visited.add(curr);

    const node = nodes.get(curr);
    if (!node) continue;

    for (const pKey of node.parentKeys) {
      if (pKey === targetAncestorKey) return true;
      if (!visited.has(pKey)) stack.push(pKey);
    }
  }
  return false;
}

export function wouldCreateCycle<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  childKey: TPopoverKey,
  candidateParentKey: TPopoverKey,
): boolean {
  if (childKey === candidateParentKey) return true;
  if (!nodes.has(candidateParentKey)) return false;
  return isReachableAncestor(nodes, candidateParentKey, childKey);
}

export function resolveReparentingCycles<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  node: InternalDAGNode<TPopoverKey>,
  cleanParentKey: TPopoverKey,
): void {
  for (const childKey of node.childrenKeys) {
    if (childKey === cleanParentKey || isReachableAncestor(nodes, cleanParentKey, childKey)) {
      const childNode = nodes.get(childKey);
      if (childNode) {
        childNode.parentKeys.delete(node.key);
        if (childNode.parentKey === node.key) {
          childNode.parentKey = [...childNode.parentKeys][0];
        }
      }
      node.childrenKeys.delete(childKey);
    }
  }
}
