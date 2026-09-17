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
import { collectDescendants, collectAncestors, getBreadcrumbs } from './dagTraversal';
import {
  computeTopologicalZIndex,
  computeTeardownPlan,
  topologicalSort,
  safeTopologicalSort,
} from './dagOrdering';
import { findRoots, findLeaves, computeMaxDepth } from './dagMetrics';
import { exportSnapshot, importSnapshot } from './dagSnapshot';
import { EMPTY_SET } from '../../types/branded';


/**
 * Directed Acyclic Graph (DAG) managing hierarchical cascade relationships between popovers.
 *
 * Popovers often open in cascading chains (e.g. Navigation Bar -> Dropdown Menu -> Flyout Submenu).
 * `PopoverDAG` maintains these parent-child links to:
 * - Prevent circular loops when reparenting or opening nested popovers.
 * - Compute clean bottom-up teardown sequences so children dismiss before parents.
 * - Calculate visual stacking order (z-index) based on cascade depth.
 * - Extract linear breadcrumb trails from root anchors to leaf popovers.
 *
 * @template TPopoverKey - String identifier type for popovers.
 *
 * @example
 * ```typescript
 * const dag = new PopoverDAG();
 *
 * dag.addNode('menu');
 * dag.addNode('submenu', 'menu');
 * dag.addNode('details', 'submenu');
 *
 * const teardownPlan = dag.getTeardownPlan('menu', true);
 * // => ['details', 'submenu', 'menu']
 * ```
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
   * Adds a directed edge (`from` -> `to`) from a parent popover to a child popover.
   *
   * Cycle prevention is strictly enforced: if adding this edge would create a cyclic dependency,
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
    return collectDescendants(this.nodes, parentKey, outSet);
  }

  /** Returns the set of all transitive reachable descendant keys from the specified parent. */
  getDescendantKeys(parentKey: TPopoverKey): Set<TPopoverKey> {
    return this.getDescendantKeysInto(parentKey, new Set<TPopoverKey>());
  }

  /** Returns the set of all ancestor keys leading to the specified child. */
  getAncestors(childKey: TPopoverKey, outSet: Set<TPopoverKey> = new Set()): Set<TPopoverKey> {
    return collectAncestors(this.nodes, childKey, outSet);
  }

  /** Returns the direct parent keys of the specified node. */
  getParents(key: TPopoverKey): ReadonlySet<TPopoverKey> {
    return this.nodes.get(key)?.parentKeys ?? EMPTY_SET;
  }

  /** Returns the direct children keys opened by the specified node. */
  getChildren(key: TPopoverKey): ReadonlySet<TPopoverKey> {
    return this.nodes.get(key)?.childrenKeys ?? EMPTY_SET;
  }


  /**
   * Computes the order-preserving linear extension restricted to the branch rooted at `rootKey`.
   */
  getTopologicalOrderForBranch(rootKey: TPopoverKey): TPopoverKey[] {
    const desc = this.getDescendantKeys(rootKey);
    return topologicalSort(this.nodes).filter((k) => k === rootKey || desc.has(k));
  }

  /**
   * Safely computes topological order, returning an Err Result if an illegal cycle is detected.
   */
  safeTopologicalSort(): TopologicalSortResult<TPopoverKey> {
    return safeTopologicalSort(this.nodes);
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
   * Returns the breadcrumb trail from root anchor to the target popover.
   *
   * @example
   * ```ts
   * const trail = dag.getBreadcrumbs('settings-dialog');
   * // ['main-menu', 'user-profile', 'settings-dialog']
   * ```
   */
  getBreadcrumbs(targetKey: TPopoverKey): TPopoverKey[] {
    return getBreadcrumbs(this.nodes, targetKey);
  }

  /** Serializes the entire graph topology into a portable snapshot envelope. */
  exportSnapshot(): DAGSnapshot<TPopoverKey> {
    return exportSnapshot(this.nodes);
  }

  /** Hydrates the graph topology from a serialized snapshot envelope. */
  importSnapshot(snapshot: DAGSnapshot<TPopoverKey>): boolean {
    return importSnapshot(snapshot, this);
  }
}
