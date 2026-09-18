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

/**
 * Serializes the DAG node dictionary into a serializable snapshot envelope.
 *
 * @template TPopoverKey - Node key identifier type.
 * @param nodes - Internal DAG node dictionary.
 * @returns Serialized DAGSnapshot containing node keys, parent connections, and depths.
 *
 * @example
 * ```typescript
 * const snapshot = exportSnapshot(dagNodes);
 * localStorage.setItem('dag_state', JSON.stringify(snapshot));
 * ```
 */
export function exportSnapshot<TPopoverKey extends string>(
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

/**
 * Hydrates a target `PopoverDAG` instance from a serialized snapshot envelope.
 *
 * Clears the target DAG and recreates all nodes and multi-parent directed edges.
 *
 * @template TPopoverKey - Node key identifier type.
 * @param snapshot - Snapshot object to import, or null/undefined.
 * @param targetDAG - Target PopoverDAG instance to hydrate into.
 * @returns True if import succeeded, false if snapshot was null or invalid.
 *
 * @example
 * ```typescript
 * const restored = importSnapshot(snapshot, targetDAG);
 * if (restored) {
 *   console.log('DAG successfully restored with size:', targetDAG.size);
 * }
 * ```
 */
export function importSnapshot<TPopoverKey extends string>(
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
