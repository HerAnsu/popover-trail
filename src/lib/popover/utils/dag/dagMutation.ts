/**
 * DAG Node and Edge Mutation Algorithms.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dag/dagMutation
 */

import type { InternalDAGNode } from './dagTypes';
import { wouldCreateCycle, resolveReparentingCycles } from './dagCycle';

function ensureNode<K extends string>(
  nodes: Map<K, InternalDAGNode<K>>,
  key: K,
): InternalDAGNode<K> {
  let node = nodes.get(key);
  if (!node) {
    node = { key, parentKey: undefined, parentKeys: new Set(), childrenKeys: new Set(), depth: 0 };
    nodes.set(key, node);
  }
  return node;
}

/**
 * Inserts a new node or updates an existing node's primary parent in the DAG.
 * Resolves reparenting cycles automatically before edge commitment.
 *
 * @template K - Key identifier type.
 * @param nodes - Internal DAG node dictionary.
 * @param key - Unique key of the node to insert.
 * @param parentKey - Optional parent key to connect under.
 *
 * @example
 * ```typescript
 * insertDAGNode(dagNodes, 'user-menu');
 * insertDAGNode(dagNodes, 'profile-card', 'user-menu');
 * ```
 */
export function insertDAGNode<K extends string>(
  nodes: Map<K, InternalDAGNode<K>>,
  key: K,
  parentKey?: K,
): void {
  const cleanParent = parentKey === key ? undefined : parentKey;
  const node = ensureNode(nodes, key);
  if (node.parentKey && node.parentKey !== cleanParent) {
    nodes.get(node.parentKey)?.childrenKeys.delete(key);
    node.parentKeys.delete(node.parentKey);
  }
  if (!cleanParent) {
    node.parentKey = undefined;
    node.depth = 0;
    return;
  }
  node.parentKey = cleanParent;
  if (wouldCreateCycle(nodes, key, cleanParent)) resolveReparentingCycles(nodes, node, cleanParent);
  const parent = nodes.get(cleanParent);
  if (parent) {
    parent.childrenKeys.add(key);
    node.parentKeys.add(cleanParent);
    node.depth = parent.depth + 1;
  }
}

/**
 * Connects a directed edge from `parentKey` to `childKey`.
 * Rejects connection and returns `false` if the edge would introduce a cycle.
 *
 * @template K - Key identifier type.
 * @param nodes - Internal DAG node dictionary.
 * @param parentKey - Starting parent node key.
 * @param childKey - Target child node key.
 * @returns True if the edge was safely connected, false if rejected due to cycle prevention.
 *
 * @example
 * ```typescript
 * const connected = connectDAGEdge(dagNodes, 'menu-a', 'submenu-b');
 * ```
 */
export function connectDAGEdge<K extends string>(
  nodes: Map<K, InternalDAGNode<K>>,
  parentKey: K,
  childKey: K,
): boolean {
  if (parentKey === childKey || wouldCreateCycle(nodes, childKey, parentKey)) return false;
  const parent = ensureNode(nodes, parentKey);
  const child = ensureNode(nodes, childKey);
  parent.childrenKeys.add(childKey);
  child.parentKeys.add(parentKey);
  if (!child.parentKey) child.parentKey = parentKey;
  child.depth = Math.max(child.depth, parent.depth + 1);
  return true;
}

/**
 * Disconnects a directed edge from `parentKey` to `childKey`.
 * Reassigns the child's primary parent pointer to a remaining parent if applicable.
 *
 * @template K - Key identifier type.
 * @param nodes - Internal DAG node dictionary.
 * @param parentKey - Starting parent node key.
 * @param childKey - Target child node key.
 *
 * @example
 * ```typescript
 * disconnectDAGEdge(dagNodes, 'menu-a', 'submenu-b');
 * ```
 */
export function disconnectDAGEdge<K extends string>(
  nodes: Map<K, InternalDAGNode<K>>,
  parentKey: K,
  childKey: K,
): void {
  nodes.get(parentKey)?.childrenKeys.delete(childKey);
  const child = nodes.get(childKey);
  if (child) {
    child.parentKeys.delete(parentKey);
    if (child.parentKey === parentKey) child.parentKey = child.parentKeys.values().next().value;
  }
}

/**
 * Removes a node and severs all connected incoming parent edges and outgoing child edges.
 *
 * @template K - Key identifier type.
 * @param nodes - Internal DAG node dictionary.
 * @param key - Key of the node to remove.
 *
 * @example
 * ```typescript
 * deleteDAGNode(dagNodes, 'profile-card');
 * ```
 */
export function deleteDAGNode<K extends string>(nodes: Map<K, InternalDAGNode<K>>, key: K): void {
  const node = nodes.get(key);
  if (!node) return;
  for (const p of node.parentKeys) nodes.get(p)?.childrenKeys.delete(key);
  for (const c of node.childrenKeys) {
    const ch = nodes.get(c);
    if (!ch) continue;
    ch.parentKeys.delete(key);
    if (ch.parentKey === key) ch.parentKey = ch.parentKeys.values().next().value;
  }
  nodes.delete(key);
}
