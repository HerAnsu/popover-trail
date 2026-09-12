/**
 * Topological DAG Ordering, Teardown Plans, and Stacking Z-Index.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dag/dagOrdering
 */

import { RingBuffer } from '../buffer';
import { sharedSetPool } from '../pool/spatialPools';
import { Ok, Err } from '../result';
import type { InternalDAGNode, TopologicalSortResult } from './dagTypes';

/**
 * Computes a bottom-up teardown order for a popover and all its descendants.
 *
 * @remarks
 * Uses post-order depth-first traversal so child popovers are closed before their
 * parents, preventing orphan popovers. Uses an internal pool (`sharedSetPool`)
 * to avoid allocations during close operations.
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
 * Topologically sorts popover nodes (parents before children) using Kahn's algorithm.
 *
 * @remarks
 * Uses a ring buffer queue to process nodes in $O(V + E)$ time without heap allocations.
 * If the graph has disconnected or cyclic components, any remaining nodes are appended at the end.
 *
 * @template TPopoverKey - Node identifier type.
 * @param nodes - Internal DAG node dictionary.
 * @returns Array of keys in topological order.
 */
export function computeLinearExtension<TPopoverKey extends string>(
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
 * Unlike `computeLinearExtension`, this function will not return a partial or corrupted order.
 * If a cycle is detected, it returns `Err(DAGCycleError)` listing all keys trapped in the cycle.
 *
 * @example
 * ```ts
 * const result = safeComputeLinearExtension(dagNodes);
 * if (isOk(result)) {
 *   console.log('Topological order:', result.value);
 * } else {
 *   console.error('Cycle detected in keys:', result.error.cycleKeys);
 * }
 * ```
 *
 * @template TPopoverKey - Node identifier type.
 * @param nodes - Internal DAG node dictionary.
 * @returns `Ok(order)` on successful sort, or `Err(DAGCycleError)` if cycles exist.
 */
export function safeComputeLinearExtension<TPopoverKey extends string>(
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
 * Computes z-index stacking order so child popovers always render above their parents.
 *
 * @remarks
 * Traverses from root anchors down the cascade, assigning strictly increasing integer
 * z-index values starting from `baseZIndex`.
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
