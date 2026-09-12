/**
 * Directed Acyclic Graph (DAG) Kernel Implementation.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dag/dagCore
 */

import type {
  DAGNode,
  InternalDAGNode,
  DAGSnapshot,
  DAGEdge,
  TopologicalSortResult,
} from './dagTypes';
import { wouldCreateCycle } from './dagCycle';
import { insertDAGNode, connectDAGEdge, disconnectDAGEdge, deleteDAGNode } from './dagMutation';
import { traverseDescendantKeys, traverseAncestorKeys, getGeodesicPath } from './dagTraversal';
import {
  computeTopologicalZIndex,
  computeTeardownPlan,
  computeLinearExtension,
  safeComputeLinearExtension,
} from './dagOrdering';
import { findRoots, findLeaves, computeMaxDepth } from './dagMetrics';
import { exportDAGSnapshot, importDAGSnapshot } from './dagSnapshot';

/**
 * Tracks parent-child relationships and manages cascade ordering for popovers.
 *
 * @remarks
 * Features:
 * - Prevents circular references when opening nested popovers.
 * - Computes clean bottom-up teardown lists when closing parent popovers.
 * - Sorts z-indices based on depth so nested popovers stay above parents.
 * - Finds direct breadcrumb paths from root to active cards.
 *
 * @template TPopoverKey - Key identifier for popover nodes.
 */
export class PopoverDAG<TPopoverKey extends string = string> {
  private readonly nodes = new Map<TPopoverKey, InternalDAGNode<TPopoverKey>>();

  /** Clears all nodes and edges from the graph. */
  clear(): void {
    this.nodes.clear();
  }

  /** Checks whether a node with the specified key exists in the graph. */
  hasNode(key: TPopoverKey): boolean {
    return this.nodes.has(key);
  }

  /** Retrieves the public immutable node record for the specified key, or undefined if missing. */
  getNode(key: TPopoverKey): DAGNode<TPopoverKey> | undefined {
    return this.nodes.get(key);
  }

  /** Total number of active nodes in the DAG. */
  get size(): number {
    return this.nodes.size;
  }

  /** Inserts a new node into the graph with an optional initial parent. */
  addNode(key: TPopoverKey, parentKey?: TPopoverKey): void {
    insertDAGNode(this.nodes, key, parentKey);
  }

  /**
   * Adds a directed cascade edge $(from \to to)$ between a parent and child node.
   *
   * @remarks
   * Cycle prevention is strictly enforced: if adding this edge would introduce a cycle,
   * the mutation is rejected and returns `false`.
   */
  addEdge(edge: DAGEdge<TPopoverKey>): boolean;
  addEdge(parentKey: TPopoverKey, childKey: TPopoverKey): boolean;
  addEdge(parentKeyOrEdge: TPopoverKey | DAGEdge<TPopoverKey>, childKey?: TPopoverKey): boolean {
    if (typeof parentKeyOrEdge === 'object' && parentKeyOrEdge !== null) {
      return connectDAGEdge(this.nodes, parentKeyOrEdge.from, parentKeyOrEdge.to);
    }
    if (typeof parentKeyOrEdge === 'string' && childKey !== undefined) {
      return connectDAGEdge(this.nodes, parentKeyOrEdge, childKey);
    }
    return false;
  }

  /** Removes a directed edge between parent and child nodes. */
  removeEdge(parentKey: TPopoverKey, childKey: TPopoverKey): void {
    disconnectDAGEdge(this.nodes, parentKey, childKey);
  }

  /** Deletes a node and severs all connected incoming and outgoing edges. */
  removeNode(key: TPopoverKey): void {
    deleteDAGNode(this.nodes, key);
  }

  /** Checks whether introducing an edge from `parentKey` to `childKey` would induce a cycle. */
  wouldCreateCycle(childKey: TPopoverKey, parentKey: TPopoverKey): boolean {
    return wouldCreateCycle(this.nodes, childKey, parentKey);
  }

  /** Traverses and populates all reachable descendant keys into a provided output set. */
  getDescendantKeysInto(parentKey: TPopoverKey, outSet: Set<TPopoverKey>): Set<TPopoverKey> {
    return traverseDescendantKeys(this.nodes, parentKey, outSet);
  }

  /** Returns the set of all transitive reachable descendant keys from the specified parent. */
  getDescendantKeys(parentKey: TPopoverKey): Set<TPopoverKey> {
    return this.getDescendantKeysInto(parentKey, new Set<TPopoverKey>());
  }

  /** Returns the set of all ancestor keys leading to the specified child. */
  getAncestors(childKey: TPopoverKey, outSet: Set<TPopoverKey> = new Set()): Set<TPopoverKey> {
    return traverseAncestorKeys(this.nodes, childKey, outSet);
  }

  /** Returns the direct parent keys of the specified node. */
  getParents(key: TPopoverKey): ReadonlySet<TPopoverKey> {
    return this.nodes.get(key)?.parentKeys ?? new Set();
  }

  /** Returns the direct children keys opened by the specified node. */
  getChildren(key: TPopoverKey): ReadonlySet<TPopoverKey> {
    return this.nodes.get(key)?.childrenKeys ?? new Set();
  }

  /**
   * Computes the order-preserving linear extension restricted to the branch rooted at `rootKey`.
   */
  getTopologicalOrderForBranch(rootKey: TPopoverKey): TPopoverKey[] {
    const desc = this.getDescendantKeys(rootKey);
    return computeLinearExtension(this.nodes).filter((k) => k === rootKey || desc.has(k));
  }

  /**
   * Computes a cycle-safe topological sort returning a `Result`.
   */
  safeComputeLinearExtension(): TopologicalSortResult<TPopoverKey> {
    return safeComputeLinearExtension(this.nodes);
  }

  /**
   * Returns all root nodes in the graph (nodes having an in-degree of 0 with no parents).
   */
  getRoots(): readonly TPopoverKey[] {
    return findRoots(this.nodes);
  }

  /**
   * Returns all leaf nodes in the graph (nodes having an out-degree of 0 with no children).
   */
  getLeaves(): readonly TPopoverKey[] {
    return findLeaves(this.nodes);
  }

  /**
   * Computes the maximum directed path depth from any root to the deepest reachable leaf node.
   */
  getMaxDepth(): number {
    return computeMaxDepth(this.nodes);
  }

  /**
   * Extracts an immutable snapshot list of all directed edges currently existing in the graph.
   */
  getEdges(): readonly DAGEdge<TPopoverKey>[] {
    const edges: DAGEdge<TPopoverKey>[] = [];
    for (const [childKey, node] of this.nodes.entries()) {
      for (const parentKey of node.parentKeys) {
        edges.push({ from: parentKey, to: childKey });
      }
    }
    return Object.freeze(edges);
  }

  /**
   * Computes a bijective z-index mapping ensuring children always stack above parents.
   */
  getTopologicalZIndexOrder(baseZIndex = 1000): Map<TPopoverKey, number> {
    return computeTopologicalZIndex(this.nodes, baseZIndex);
  }

  /**
   * Computes a bottom-up teardown sequence ordered from deepest leaves to root.
   */
  getTeardownPlan(rootKey: TPopoverKey, includeRoot = false): TPopoverKey[] {
    return computeTeardownPlan(this.nodes, rootKey, includeRoot);
  }

  /**
   * Extracts the unique geodesic path from the root anchor to the specified target node.
   */
  getGeodesicPath(targetKey: TPopoverKey): TPopoverKey[] {
    return getGeodesicPath(this.nodes, targetKey);
  }

  /** Serializes the entire graph topology into a portable snapshot envelope. */
  exportSnapshot(): DAGSnapshot<TPopoverKey> {
    return exportDAGSnapshot(this.nodes);
  }

  /** Hydrates the graph topology from a serialized snapshot envelope. */
  importSnapshot(snapshot: DAGSnapshot<TPopoverKey>): boolean {
    return importDAGSnapshot(snapshot, this);
  }
}
