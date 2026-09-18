/**
 * Cycle Detection and Resolution for Multi-Parent DAGs.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dag/dagCycle
 */

import type { InternalDAGNode } from './dagTypes';

/**
 * Checks if a target ancestor key is reachable by traversing up the parent hierarchy.
 *
 * @remarks
 * Uses an iterative depth-first search (DFS) with a visited set to avoid infinite loops.
 * Returns `true` if `startKey === targetAncestorKey` or if `targetAncestorKey` is an ancestor.
 *
 * @example
 * ```ts
 * const isAncestor = isReachableAncestor(nodes, 'leafPopover', 'rootMenu');
 * if (isAncestor) {
 *   console.log('rootMenu is an ancestor of leafPopover');
 * }
 * ```
 *
 * @template TPopoverKey - Node identifier type.
 * @param nodes - Kernel DAG node dictionary.
 * @param startKey - Popover key to begin traversing upward from.
 * @param targetAncestorKey - Ancestor popover key to search for.
 * @returns `true` if reachable as an ancestor, otherwise `false`.
 */
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

/**
 * Checks whether adding a directed edge from `candidateParentKey` to `childKey` would create a cycle.
 *
 * @remarks
 * An edge `candidateParentKey -> childKey` creates a cycle if and only if `childKey` is already
 * an ancestor of `candidateParentKey` (i.e. `candidateParentKey` can reach `childKey` going up).
 *
 * @example
 * ```ts
 * if (wouldCreateCycle(nodes, 'childCard', 'parentCard')) {
 *   throw new Error('Adding this parent edge would create a cycle!');
 * }
 * ```
 *
 * @template TPopoverKey - Node identifier type.
 * @param nodes - Kernel DAG node dictionary.
 * @param childKey - Proposed child popover key.
 * @param candidateParentKey - Proposed parent popover key.
 * @returns `true` if edge insertion would produce a cyclic dependency.
 */
export function wouldCreateCycle<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  childKey: TPopoverKey,
  candidateParentKey: TPopoverKey,
): boolean {
  if (childKey === candidateParentKey) return true;
  if (!nodes.has(candidateParentKey)) return false;
  return isReachableAncestor(nodes, candidateParentKey, childKey);
}

/**
 * Prunes conflicting child edges before reparenting a popover node to prevent circular loops.
 *
 * In the cascading popover hierarchy, when a card `node` adopts `cleanParentKey` as its new parent
 * (for example, during reparenting or multi-parent attachment), any existing child of `node` that
 * is already an ancestor of `cleanParentKey` would form an infinite loop. This function severs
 * those conflicting downward edges and safely reassigns primary parent pointers.
 *
 * @template TPopoverKey - Node identifier type.
 * @param nodes - Kernel DAG node dictionary.
 * @param node - The node being reparented.
 * @param cleanParentKey - The proposed new parent key for `node`.
 *
 * @example
 * ```typescript
 * // Ensure reparenting cardB to cardC won't cause circular references
 * resolveReparentingCycles(dagNodes, cardBNode, 'cardC');
 * ```
 */
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
          childNode.parentKey = childNode.parentKeys.values().next().value;
        }
      }
      node.childrenKeys.delete(childKey);
    }
  }
}
