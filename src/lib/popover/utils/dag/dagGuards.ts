/**
 * Directed Acyclic Graph (DAG) Topology Type Guards.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dag/dagGuards
 */

import type { DAGNode } from './dagTypes';

/**
 * Validates whether an unknown value conforms to a DAGNode structure.
 */
export function isDAGNode<TPopoverKey extends string = string>(
  val: unknown,
): val is DAGNode<TPopoverKey> {
  if (typeof val !== 'object' || val === null) return false;
  return (
    'key' in val &&
    typeof val.key === 'string' &&
    val.key.length > 0 &&
    (!('parentKey' in val) || val.parentKey === undefined || typeof val.parentKey === 'string') &&
    'childrenKeys' in val &&
    val.childrenKeys instanceof Set &&
    (!('parentKeys' in val) || val.parentKeys === undefined || val.parentKeys instanceof Set) &&
    'depth' in val &&
    typeof val.depth === 'number' &&
    Number.isFinite(val.depth) &&
    val.depth >= 0
  );
}

/**
 * Checks whether a given DAG node is a root node (has no parents and depth 0).
 */
export function isRootDAGNode<TPopoverKey extends string = string>(
  node: DAGNode<TPopoverKey>,
): boolean {
  const hasNoParents = node.parentKeys ? node.parentKeys.size === 0 : node.parentKey === undefined;
  return hasNoParents && node.depth === 0;
}

/**
 * Checks whether a given DAG node is a leaf node (has no children).
 */
export function isLeafDAGNode<TPopoverKey extends string = string>(
  node: DAGNode<TPopoverKey>,
): boolean {
  return node.childrenKeys.size === 0;
}
