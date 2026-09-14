/**
 * Graph Serialization and Snapshot Restoration.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dag/dagSnapshot
 */

import type { DAGSnapshot, InternalDAGNode } from './dagTypes';
import type { PopoverDAG } from './dagCore';
import { isArray } from '../guards/arrayGuards';
import { partition } from '../collections';

export function exportDAGSnapshot<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
): DAGSnapshot<TPopoverKey> {
  const list = [];
  for (const node of nodes.values()) {
    list.push({
      key: node.key,
      parentKeys: [...node.parentKeys],
      depth: node.depth,
    });
  }
  return { nodes: list };
}

export function importDAGSnapshot<TPopoverKey extends string>(
  snapshot: DAGSnapshot<TPopoverKey> | null | undefined,
  targetDAG: PopoverDAG<TPopoverKey>,
): boolean {
  if (!snapshot || !isArray(snapshot.nodes)) return false;
  targetDAG.clear();

  const [nodesWithParents] = partition(
    snapshot.nodes,
    (item) => isArray(item?.parentKeys) && item.parentKeys.length > 0,
  );

  for (const item of snapshot.nodes) {
    if (item && item.key) targetDAG.addNode(item.key);
  }
  for (const item of nodesWithParents) {
    if (item && item.key && isArray(item.parentKeys)) {
      for (const p of item.parentKeys) targetDAG.addEdge(p, item.key);
    }
  }
  return true;
}
