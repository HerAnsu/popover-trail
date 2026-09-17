/**
 * Cycle Detection and Resolution for Multi-Parent Directed Acyclic Graphs (DAG).
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @remarks
 * **Contributor Architectural Guide**:
 * - **Graph Invariant $\mathcal{I}_{\text{Acyclic}}$**: The active cascading hierarchy forms a strict
 *   Directed Acyclic Graph $G = (V, E)$, with guaranteed cycle freedom and deterministic traversal paths.
 *   Inserting edge $(u, v)$ is admitted if and only if $u \notin \text{Descendants}(v)$, or equivalently
 *   $v \notin \text{Ancestors}(u)$.
 * - **Multi-Parent Topology**: A popover card can have multiple triggering anchors (e.g. pinned card
 *   receiving connections from multiple sources), making this a general DAG rather than a simple tree.
 * - **Clean Architecture Boundaries**: Layer 1 module. Must have zero dependencies on React, Zustand,
 *   DOM globals (`document`, `window`), or Layer 2/3/4 stores.
 *
 * @module utils/dag/dagCycle
 */

import type { InternalDAGNode } from './dagTypes';

/**
 * Checks if a target ancestor key is reachable by traversing up the parent hierarchy.
 *
 * @remarks
 * **Contributor Note**:
 * - **Algorithm**: Iterative Depth-First Search (DFS) traversing incoming directed parent edges.
 *   An explicit stack and `visited` set are used instead of recursion to prevent call-stack overflows
 *   on deeply nested cascades and to guard against cyclic references in partially mutated states.
 * - **Complexity**: $O(|V| + |E|)$ worst-case, where $|V|$ is the number of active popover nodes
 *   and $|E|$ is the number of hierarchical cascade edges. Typically bounded by tree depth $O(\text{Depth})$.
 * - **Refactoring Caution**: In multi-parent DAGs, a node can be reached through multiple distinct
 *   branches; never remove `visited.has(curr)` or execution may degenerate into exponential re-traversals.
 *
 * @template TPopoverKey - Branded or nominal string node identifier.
 * @param nodes - Kernel DAG node dictionary.
 * @param startKey - Popover key to begin traversing upward from.
 * @param targetAncestorKey - Ancestor popover key to search for.
 * @returns `true` if `targetAncestorKey` is an ancestor of `startKey` (or identical); otherwise `false`.
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
 * Evaluates whether inserting a directed edge `(candidateParentKey -> childKey)` would violate acyclicity.
 *
 * @remarks
 * **Contributor Note**:
 * - **Invariant Enforced**: An edge `candidateParentKey -> childKey` creates a cycle if and only if
 *   `childKey` is already an ancestor of `candidateParentKey` ($\text{childKey} \in \text{Ancestors}(\text{candidateParentKey})$).
 * - **Execution Order**: Contributors MUST call this check *prior* to mutating `parentKeys` or `childrenKeys`
 *   in `dagMutation.ts` or store reducers. Never perform post-hoc cycle detection after mutating state.
 * - **Reflexive Self-Loop**: Direct self-loops (`childKey === candidateParentKey`) are rejected in $O(1)$ time.
 *
 * @template TPopoverKey - Node identifier type.
 * @param nodes - Kernel DAG node dictionary.
 * @param childKey - Proposed child popover key.
 * @param candidateParentKey - Proposed parent popover key.
 * @returns `true` if edge insertion would produce a cycle; otherwise `false`.
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
 * Prunes conflicting child edges before reparenting a node to prevent cycle formation.
 *
 * @remarks
 * **Contributor Note**:
 * - **Reparenting Invariant**: When node $N$ is reparented under $P_{\text{new}}$, any descendant $C$ of $N$
 *   that is also an ancestor of $P_{\text{new}}$ must be decoupled from $N$ to preserve acyclicity.
 * - **Dangling Pointer Prevention**: When removing edge $(N, C)$, if $N$ was the primary `parentKey` of $C$,
 *   this function deterministically reassigns `childNode.parentKey` to another remaining parent key from
 *   `childNode.parentKeys`, or `undefined` if no parents remain.
 * - **Mutations**: Mutates the provided `nodes` map in-place during kernel transaction phases.
 *
 * @template TPopoverKey - Node identifier type.
 * @param nodes - Kernel DAG node dictionary.
 * @param node - The node being reparented.
 * @param cleanParentKey - The proposed new parent key for `node`.
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
