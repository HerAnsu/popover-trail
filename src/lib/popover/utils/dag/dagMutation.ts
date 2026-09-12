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

export function disconnectDAGEdge<K extends string>(
  nodes: Map<K, InternalDAGNode<K>>,
  parentKey: K,
  childKey: K,
): void {
  nodes.get(parentKey)?.childrenKeys.delete(childKey);
  const child = nodes.get(childKey);
  if (child) {
    child.parentKeys.delete(parentKey);
    if (child.parentKey === parentKey) child.parentKey = [...child.parentKeys][0];
  }
}

export function deleteDAGNode<K extends string>(nodes: Map<K, InternalDAGNode<K>>, key: K): void {
  const node = nodes.get(key);
  if (!node) return;
  for (const p of node.parentKeys) nodes.get(p)?.childrenKeys.delete(key);
  for (const c of node.childrenKeys) {
    const ch = nodes.get(c);
    if (!ch) continue;
    ch.parentKeys.delete(key);
    if (ch.parentKey === key) ch.parentKey = [...ch.parentKeys][0];
  }
  nodes.delete(key);
}
