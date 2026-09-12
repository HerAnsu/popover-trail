/**
 * Directed Acyclic Graph (DAG) Kernel Implementation.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/dag/dagCore
 */

import type { DAGNode, InternalDAGNode, DAGSnapshot } from './dagTypes';
import { wouldCreateCycle } from './dagCycle';
import { insertDAGNode, connectDAGEdge, disconnectDAGEdge, deleteDAGNode } from './dagMutation';
import { traverseDescendantKeys, traverseAncestorKeys, getGeodesicPath } from './dagTraversal';
import {
  computeTopologicalZIndex,
  computeTeardownPlan,
  computeLinearExtension,
} from './dagOrdering';
import { exportDAGSnapshot, importDAGSnapshot } from './dagSnapshot';

export class PopoverDAG<TPopoverKey extends string = string> {
  private readonly nodes = new Map<TPopoverKey, InternalDAGNode<TPopoverKey>>();

  clear(): void {
    this.nodes.clear();
  }
  hasNode(key: TPopoverKey): boolean {
    return this.nodes.has(key);
  }
  getNode(key: TPopoverKey): DAGNode<TPopoverKey> | undefined {
    return this.nodes.get(key);
  }
  get size(): number {
    return this.nodes.size;
  }

  addNode(key: TPopoverKey, parentKey?: TPopoverKey): void {
    insertDAGNode(this.nodes, key, parentKey);
  }

  addEdge(parentKey: TPopoverKey, childKey: TPopoverKey): boolean {
    return connectDAGEdge(this.nodes, parentKey, childKey);
  }

  removeEdge(parentKey: TPopoverKey, childKey: TPopoverKey): void {
    disconnectDAGEdge(this.nodes, parentKey, childKey);
  }

  removeNode(key: TPopoverKey): void {
    deleteDAGNode(this.nodes, key);
  }

  wouldCreateCycle(childKey: TPopoverKey, parentKey: TPopoverKey): boolean {
    return wouldCreateCycle(this.nodes, childKey, parentKey);
  }

  getDescendantKeysInto(parentKey: TPopoverKey, outSet: Set<TPopoverKey>): Set<TPopoverKey> {
    return traverseDescendantKeys(this.nodes, parentKey, outSet);
  }

  getDescendantKeys(parentKey: TPopoverKey): Set<TPopoverKey> {
    return this.getDescendantKeysInto(parentKey, new Set<TPopoverKey>());
  }

  getAncestors(childKey: TPopoverKey, outSet: Set<TPopoverKey> = new Set()): Set<TPopoverKey> {
    return traverseAncestorKeys(this.nodes, childKey, outSet);
  }

  getParents(key: TPopoverKey): ReadonlySet<TPopoverKey> {
    return this.nodes.get(key)?.parentKeys ?? new Set();
  }

  getChildren(key: TPopoverKey): ReadonlySet<TPopoverKey> {
    return this.nodes.get(key)?.childrenKeys ?? new Set();
  }

  getTopologicalOrderForBranch(rootKey: TPopoverKey): TPopoverKey[] {
    const desc = this.getDescendantKeys(rootKey);
    return computeLinearExtension(this.nodes).filter((k) => k === rootKey || desc.has(k));
  }

  getTopologicalZIndexOrder(baseZIndex = 1000): Map<TPopoverKey, number> {
    return computeTopologicalZIndex(this.nodes, baseZIndex);
  }

  getTeardownPlan(rootKey: TPopoverKey, includeRoot = false): TPopoverKey[] {
    return computeTeardownPlan(this.nodes, rootKey, includeRoot);
  }

  getGeodesicPath(targetKey: TPopoverKey): TPopoverKey[] {
    return getGeodesicPath(this.nodes, targetKey);
  }

  exportSnapshot(): DAGSnapshot<TPopoverKey> {
    return exportDAGSnapshot(this.nodes);
  }

  importSnapshot(snapshot: DAGSnapshot<TPopoverKey>): boolean {
    return importDAGSnapshot(snapshot, this);
  }
}
