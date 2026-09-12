/**
 * Topological DAG Ordering, Teardown Plans, and Stacking Z-Index.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dag/dagOrdering
 */

import { RingBuffer } from '../buffer';
import { sharedSetPool } from '../pool/spatialPools';
import type { InternalDAGNode } from './dagTypes';

export function computeTeardownPlan<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  rootKey: TPopoverKey,
  includeRoot = false,
): TPopoverKey[] {
  const order: TPopoverKey[] = [];
  sharedSetPool.use((visited) => {
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

export function computeLinearExtension<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
): TPopoverKey[] {
  const inDegree = new Map<TPopoverKey, number>();
  for (const [key, node] of nodes.entries()) inDegree.set(key, node.parentKeys.size);

  const queue = new RingBuffer<TPopoverKey>({ capacity: Math.max(16, nodes.size), autoExpand: true });
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

  for (const key of nodes.keys()) if (!order.includes(key)) order.push(key);
  return order;
}

export function computeTopologicalZIndex<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  baseZIndex = 1000,
): Map<TPopoverKey, number> {
  const result = new Map<TPopoverKey, number>();
  let currentZ = baseZIndex;
  sharedSetPool.use((visited) => {
    const visit = (k: TPopoverKey): void => {
      if (visited.has(k)) return;
      visited.add(k);
      const node = nodes.get(k);
      if (!node) return;
      result.set(k, currentZ++);
      for (const c of node.childrenKeys) visit(c);
    };
    for (const [k, n] of nodes.entries()) if (n.parentKeys.size === 0 || !n.parentKey) visit(k);
    for (const k of nodes.keys()) if (!visited.has(k)) visit(k);
  });
  return result;
}
