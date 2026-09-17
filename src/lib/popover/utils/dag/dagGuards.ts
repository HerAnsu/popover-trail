/**
 * Directed Acyclic Graph (DAG) Topology Type Guards.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dag/dagGuards
 */

import type { DAGNode } from './dagTypes';

/**
 * Validates whether an unknown value conforms to a valid `DAGNode` structure.
 *
 * @template TPopoverKey - Node key identifier type.
 * @param val - Unknown candidate value to validate.
 * @returns True if value is a valid DAGNode record.
 *
 * @example
 * ```typescript
 * if (isDAGNode(item)) {
 *   console.log('Valid DAG node at depth:', item.depth);
 * }
 * ```
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
 * Checks whether a given DAG node is a root anchor (has no incoming parent edges and depth 0).
 *
 * @template TPopoverKey - Node key identifier type.
 * @param node - Target DAG node to check.
 * @returns True if the node has zero parents and depth 0.
 *
 * @example
 * ```typescript
 * if (isRootNode(node)) {
 *   console.log('Node is a root anchor');
 * }
 * ```
 */
export function isRootNode<TPopoverKey extends string = string>(
  node: DAGNode<TPopoverKey>,
): boolean {
  const hasNoParents = node.parentKeys ? node.parentKeys.size === 0 : node.parentKey === undefined;
  return hasNoParents && node.depth === 0;
}

/**
 * Checks whether a given DAG node is a leaf (has no outgoing child edges).
 *
 * @template TPopoverKey - Node key identifier type.
 * @param node - Target DAG node to check.
 * @returns True if the node has zero children.
 *
 * @example
 * ```typescript
 * if (isLeafNode(node)) {
 *   console.log('Node is an outermost leaf popover');
 * }
 * ```
 */
export function isLeafNode<TPopoverKey extends string = string>(
  node: DAGNode<TPopoverKey>,
): boolean {
  return node.childrenKeys.size === 0;
}
