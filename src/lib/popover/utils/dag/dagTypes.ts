/**
 * Multi-Parent DAG Node and Graph Type Definitions.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dag/dagTypes
 */

import type { Result } from '../result';

/**
 * Public immutable representation of a node within the cascade Directed Acyclic Graph (DAG).
 *
 * @remarks
 * In `popover-trail`, the popover cascade forms a directed acyclic graph (DAG). While standard trees
 * only allow a single parent, multi-parent DAGs accommodate complex shared or merged cascade branches.
 *
 * @template TPopoverKey - Branded or nominal string key identifying popover nodes.
 */
export interface DAGNode<TPopoverKey extends string = string> {
  /** Unique domain identifier for this popover node. */
  readonly key: TPopoverKey;
  /** Primary or most recent parent key for single-parent backward compatibility. */
  parentKey?: TPopoverKey;
  /** Complete set of parent keys for true multi-parent DAG support. */
  readonly parentKeys: ReadonlySet<TPopoverKey>;
  /** Complete set of direct child keys opened by this popover. */
  readonly childrenKeys: ReadonlySet<TPopoverKey>;
  /** Longest directed path depth from any root anchor node. */
  depth: number;
}

/**
 * Internal mutable representation of a DAG node maintained in kernel state.
 *
 * @template TPopoverKey - Node key type.
 */
export interface InternalDAGNode<TPopoverKey extends string = string> {
  /** Node identifier. */
  readonly key: TPopoverKey;
  /** Primary parent key. */
  parentKey?: TPopoverKey;
  /** Mutable set of parent node keys. */
  readonly parentKeys: Set<TPopoverKey>;
  /** Mutable set of child node keys. */
  readonly childrenKeys: Set<TPopoverKey>;
  /** Computed topological depth. */
  depth: number;
}

/**
 * Serializable representation of a DAG node suitable for JSON transfer and cross-tab broadcasts.
 *
 * @template TPopoverKey - Node key type.
 */
export interface SerializedDAGNode<TPopoverKey extends string = string> {
  /** Unique key of the popover. */
  readonly key: TPopoverKey;
  /** Array of parent keys representing directed incoming edges. */
  readonly parentKeys: readonly TPopoverKey[];
  /** Longest directed topological depth. */
  readonly depth: number;
}

/**
 * Complete immutable snapshot of the DAG topology for persistence and causal replay.
 *
 * @template TPopoverKey - Node key type.
 */
export interface DAGSnapshot<TPopoverKey extends string = string> {
  /** Collection of serialized nodes within the snapshot. */
  readonly nodes: readonly SerializedDAGNode<TPopoverKey>[];
}

/**
 * Directed edge representation within the cascade Directed Acyclic Graph,
 * directed from parent node `from` to child node `to`.
 *
 * @template TPopoverKey - Node key type.
 */
export interface DAGEdge<TPopoverKey extends string = string> {
  /** Originating parent node key. */
  readonly from: TPopoverKey;
  /** Target child node key. */
  readonly to: TPopoverKey;
}

/**
 * Diagnostic error payload returned when an illegal cycle prevents topological resolution.
 *
 * @remarks
 * When cycle detection triggers, this object contains all keys participating in the detected cycle
 * to provide unambiguous debugging context without throwing runtime exceptions.
 *
 * @template TPopoverKey - Node key type.
 */
export interface DAGCycleError<TPopoverKey extends string = string> {
  readonly type: 'DAG_CYCLE_ERROR';
  /** Human-readable description of the cycle failure. */
  readonly message: string;
  /** List of keys belonging to the unreachable cycle component. */
  readonly cycleKeys: readonly TPopoverKey[];
}

/**
 * Result of topological sort: array of sorted keys on success, or a cycle error on failure.
 *
 * Either:
 * - `Ok(readonly TPopoverKey[])`: Sorted keys where parent popovers appear before their children.
 * - `Err(DAGCycleError<TPopoverKey>)`: Cycle detected during resolution.
 *
 * @template TPopoverKey - Node key type.
 */
export type TopologicalSortResult<TPopoverKey extends string = string> = Result<
  readonly TPopoverKey[],
  DAGCycleError<TPopoverKey>
>;
