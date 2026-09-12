/**
 * Topological DAG Traversal, Streaming Visitors, and Geodesic Paths.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dag/dagTraversal
 */

import { RingBuffer } from '../buffer';
import type { InternalDAGNode } from './dagTypes';

export function visitDescendants<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  parentKey: TPopoverKey,
  visitor: (key: TPopoverKey) => boolean | void,
  visited: Set<TPopoverKey> = new Set<TPopoverKey>(),
): boolean {
  const stack: TPopoverKey[] = [parentKey];
  while (stack.length > 0) {
    const currentKey = stack.pop();
    if (!currentKey) continue;
    const node = nodes.get(currentKey);
    if (!node) continue;

    for (const childKey of node.childrenKeys) {
      if (!visited.has(childKey) && childKey !== parentKey) {
        visited.add(childKey);
        if (visitor(childKey) === false) return false;
        stack.push(childKey);
      }
    }
  }
  return true;
}

export function traverseDescendantKeys<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  parentKey: TPopoverKey,
  outSet: Set<TPopoverKey>,
): Set<TPopoverKey> {
  visitDescendants(nodes, parentKey, (key) => { outSet.add(key); }, outSet);
  return outSet;
}

export function traverseAncestorKeys<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  childKey: TPopoverKey,
  outSet: Set<TPopoverKey> = new Set<TPopoverKey>(),
): Set<TPopoverKey> {
  const stack: TPopoverKey[] = [childKey];
  while (stack.length > 0) {
    const currentKey = stack.pop();
    if (!currentKey) continue;
    const node = nodes.get(currentKey);
    if (!node) continue;

    for (const pKey of node.parentKeys) {
      if (!outSet.has(pKey) && pKey !== childKey) {
        outSet.add(pKey);
        stack.push(pKey);
      }
    }
  }
  return outSet;
}

export function getGeodesicPath<TPopoverKey extends string>(
  nodes: Map<TPopoverKey, InternalDAGNode<TPopoverKey>>,
  targetKey: TPopoverKey,
): TPopoverKey[] {
  if (!nodes.has(targetKey)) return [];
  const path = new RingBuffer<TPopoverKey>({
    capacity: 16, autoExpand: true, initialItems: [targetKey],
  });
  let curr = nodes.get(targetKey);

  while (curr && curr.parentKey) {
    const nextKey = curr.parentKey;
    if (path.includes(nextKey)) break;
    path.unshift(nextKey);
    curr = nodes.get(nextKey);
  }
  return path.toArray();
}
