/**
 * Multi-Parent DAG Node and Graph Type Definitions.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dag/dagTypes
 */

export interface DAGNode<TPopoverKey extends string = string> {
  readonly key: TPopoverKey;
  /** Primary or most recent parent (backward-compatible). */
  parentKey?: TPopoverKey;
  /** Full set of parent keys for true multi-parent DAG. */
  readonly parentKeys: ReadonlySet<TPopoverKey>;
  /** Full set of child keys. */
  readonly childrenKeys: ReadonlySet<TPopoverKey>;
  /** Longest directed path depth from any root. */
  depth: number;
}

export interface InternalDAGNode<TPopoverKey extends string = string> {
  readonly key: TPopoverKey;
  parentKey?: TPopoverKey;
  readonly parentKeys: Set<TPopoverKey>;
  readonly childrenKeys: Set<TPopoverKey>;
  depth: number;
}

export interface SerializedDAGNode<TPopoverKey extends string = string> {
  readonly key: TPopoverKey;
  readonly parentKeys: readonly TPopoverKey[];
  readonly depth: number;
}

export interface DAGSnapshot<TPopoverKey extends string = string> {
  readonly nodes: readonly SerializedDAGNode<TPopoverKey>[];
}
