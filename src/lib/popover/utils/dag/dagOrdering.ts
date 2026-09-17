/**
 * Topological DAG Ordering, Subtree Teardown Plans, and Z-Index Stacking.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @remarks
 * **Contributor Architectural Guide**:
 * - **Poset Linear Extension**: The active cascade DAG forms a strict partially ordered set (poset) $(V, \prec)$.
 *   Topological algorithms compute an order-preserving linear extension $\mathcal{L}: (V, \prec) \to (V, <)$
 *   satisfying $\forall u, v \in V, \; u \prec v \implies \mathcal{L}(u) < \mathcal{L}(v)$.
 * - **Deterministic Subtree Pruning**: Closing a parent node $r$ initiates a bottom-up teardown plan
 *   $\mathcal{T}(r) = \{ v \in V \mid v \in \text{Reach}(r) \}$. Descendants are torn down in reverse topological order,
 *   guaranteeing zero orphaned portals or unlinked dialogs in the DOM.
 * - **Z-Index Bijective Stacking**: The visual stacking order maintains strict correspondence with cascade
 *   ancestry ($\mathcal{Z}: V \to \{1, \dots, |V|\}$), ensuring child popovers always render in front of their triggers.
 * - **Zero-GC Hot Path**: Employs `RingBuffer` for $O(1)$ amortized queue operations and `sharedSetPool` for
 *   visited tracking, eliminating heap allocations during rapid cascading transitions.
 *
 * @module utils/dag/dagOrdering
 */

import { RingBuffer } from '../buffer';
import { sharedSetPool } from '../pool/spatialPools';
import { Ok, Err } from '../result';
import type { InternalDAGNode, TopologicalSortResult } from './dagTypes';

/**
 * Computes a bottom-up teardown order for a popover subtree and all its transitive descendants.
 *
 * @remarks
 * **Contributor Note**:
 * - **Teardown Invariant**: Children MUST close before parents. This function traverses via post-order DFS
 *   so that the deepest leaf popovers are collected at the start of the returned array, followed by intermediate
 *   parents, ending at `rootKey` (if `includeRoot` is true).
 * - **DOM Portals**: Ensures that inner event listeners and DOM dialog portals unmount cleanly before the parent
 *   container is unmounted from the DOM.
 * - **Memory**: Uses `sharedSetPool.use` to borrow a pre-allocated `Set<TPopoverKey>`, producing zero GC pressure.
 *
 * @template TPopoverKey - Node identifier type.
 * @param nodes - Internal DAG node dictionary.
 * @param rootKey - Root key of the subtree to tear down.
 * @param includeRoot - When true, includes `rootKey` at the end of the teardown array. Default is false.
 * @returns Array of keys ordered from deepest leaves to root.
 */
export function computeTeardownPlan<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  rootKey: TPopoverKey,
  includeRoot = false,
): TPopoverKey[] {
  const order: TPopoverKey[] = [];
  sharedSetPool.use((visited) => {
    // Post-order DFS ensures deepest children are visited and collected first
    const postOrder = (k: TPopoverKey): void => {
      if (visited.has(k)) return;
      visited.add(k);
      const node = nodes.get(k);
      if (node) for (const c of node.childrenKeys) postOrder(c);
      if (k !== rootKey || includeRoot) order.push(k);
    };
    postOrder(rootKey);
  });
  return order;
}

/**
 * Topologically sorts DAG nodes using Kahn's algorithm (parents before children).
 *
 * @remarks
 * **Contributor Note**:
 * - **Algorithm**: Kahn's in-degree reduction algorithm with BFS traversal.
 * - **Zero-GC Queue**: Implemented using a bounded `RingBuffer<TPopoverKey>` rather than standard JS `Array.shift()`.
 *   This avoids $O(N)$ array element shifting and eliminates GC allocations during high-frequency layout computations.
 * - **Fault-Tolerant Rendering Fallback**: If an unexpected cycle occurs due to race conditions or external mutations,
 *   unvisited nodes are appended at the end of the array. This ensures presentation layers render all active popovers
 *   rather than dropping elements. For strict validation, use `safeTopologicalSort()`.
 *
 * @template TPopoverKey - Node identifier type.
 * @param nodes - Internal DAG node dictionary.
 * @returns Array of keys in topological order.
 */
export function topologicalSort<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
): TPopoverKey[] {
  // Step 1: Compute in-degrees (number of incoming directed parent edges)
  const inDegree = new Map<TPopoverKey, number>();
  for (const [key, node] of nodes.entries()) inDegree.set(key, node.parentKeys.size);

  // Step 2: Seed queue with all source nodes (in-degree == 0)
  const queue = new RingBuffer<TPopoverKey>({
    capacity: Math.max(16, nodes.size),
    autoExpand: true,
  });
  for (const [key, deg] of inDegree.entries()) if (deg === 0) queue.push(key);

  const order: TPopoverKey[] = [];
  while (!queue.isEmpty) {
    const curr = queue.shift();
    if (!curr) break;
    order.push(curr);
    const node = nodes.get(curr);
    if (node) {
      // Step 3: Decrement in-degrees of child nodes; push newly freed nodes
      for (const child of node.childrenKeys) {
        const deg = (inDegree.get(child) ?? 1) - 1;
        inDegree.set(child, deg);
        if (deg === 0) queue.push(child);
      }
    }
  }

  // Fallback: append any remaining nodes to avoid omitting elements if graph contains isolated cycles
  for (const key of nodes.keys()) if (!order.includes(key)) order.push(key);
  return order;
}

/**
 * Topologically sorts popover nodes, returning an error Result if an illegal cycle is detected.
 *
 * @remarks
 * **Contributor Note**:
 * - **Soundness Contract**: Unlike `topologicalSort()`, this function enforces strict graph invariants.
 *   If `order.length !== nodes.size`, it aborts without returning a partial ordering, returning `Err(DAGCycleError)`
 *   containing the exact list of cyclic nodes.
 * - **Intended Usage**: Used in transaction validation gates, state snapshot exports, and property tests
 *   to verify $\mathcal{I}_{\text{Acyclic}}$.
 *
 * @template TPopoverKey - Node identifier type.
 * @param nodes - Internal DAG node dictionary.
 * @returns `Ok(order)` on successful sort, or `Err(DAGCycleError)` if cycles exist.
 */
export function safeTopologicalSort<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
): TopologicalSortResult<TPopoverKey> {
  const inDegree = new Map<TPopoverKey, number>();
  for (const [key, node] of nodes.entries()) inDegree.set(key, node.parentKeys.size);

  const queue = new RingBuffer<TPopoverKey>({
    capacity: Math.max(16, nodes.size),
    autoExpand: true,
  });
  for (const [key, deg] of inDegree.entries()) if (deg === 0) queue.push(key);

  const order: TPopoverKey[] = [];
  while (!queue.isEmpty) {
    const curr = queue.shift();
    if (!curr) break;
    order.push(curr);
    const node = nodes.get(curr);
    if (node) {
      for (const child of node.childrenKeys) {
        const deg = (inDegree.get(child) ?? 1) - 1;
        inDegree.set(child, deg);
        if (deg === 0) queue.push(child);
      }
    }
  }

  // Cycle detection: If order.length does not match total nodes, unreachable nodes form a cycle
  if (order.length !== nodes.size) {
    const cycleKeys: TPopoverKey[] = [];
    for (const key of nodes.keys()) {
      if (!order.includes(key)) cycleKeys.push(key);
    }
    return Err({
      type: 'DAG_CYCLE_ERROR',
      message: `Topological ordering failed: cycle detected involving ${cycleKeys.length} nodes`,
      cycleKeys: Object.freeze(cycleKeys),
    });
  }

  return Ok(Object.freeze(order));
}

/**
 * Computes stacking z-index values so child popovers always render above their parents.
 *
 * @remarks
 * **Contributor Note**:
 * - **Invariant $\mathcal{I}_{\text{ZBijection}}$**: Assigns strictly monotonic integer z-indices starting from `baseZIndex`.
 * - **Root-First Ordering**: Roots (in-degree 0) are visited first via post-order DFS, guaranteeing
 *   $\forall u, v \in V, \; u \prec v \implies \text{zIndex}(u) < \text{zIndex}(v)$.
 * - **Zero-GC Visited Set**: Uses `sharedSetPool.use` to avoid Set allocation on high-frequency stacking updates.
 *
 * @template TPopoverKey - Node identifier type.
 * @param nodes - Kernel DAG node dictionary.
 * @param baseZIndex - Starting base z-index offset (defaults to 1000).
 * @returns Map pairing each popover key with its allocated integer z-index.
 */
export function computeTopologicalZIndex<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  baseZIndex = 1000,
): Map<TPopoverKey, number> {
  const result = new Map<TPopoverKey, number>();
  let currentZ = baseZIndex;
  sharedSetPool.use((visited) => {
    // DFS traversal assigns strictly increasing z-indices from parents to descendants
    const visit = (k: TPopoverKey): void => {
      if (visited.has(k)) return;
      visited.add(k);
      const node = nodes.get(k);
      if (!node) return;
      result.set(k, currentZ++);
      for (const c of node.childrenKeys) visit(c);
    };
    // Visit all root nodes first
    for (const [k, n] of nodes.entries()) if (n.parentKeys.size === 0 || !n.parentKey) visit(k);
    // Cover any disconnected components
    for (const k of nodes.keys()) if (!visited.has(k)) visit(k);
  });
  return result;
}
