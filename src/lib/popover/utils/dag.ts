/**
 * Represents a single node inside the popover hierarchy graph.
 */
export interface DAGNode {
  /** Unique identifier of this popover node. */
  key: string;
  /** Parent popover identifier, or undefined if this is a root popover. */
  parentKey?: string;
  /** Direct children keys spawned from this node. */
  childrenKeys: Set<string>;
  /** Topological depth level in the cascade tree (0 for root). */
  depth: number;
}

/**
 * Directed Acyclic Graph (DAG) Kernel for popover-trail.
 * Manages parent-child relationship hierarchies, cycle prevention, cascade pruning, and topological z-index sorting.
 *
 * @example
 * ```typescript
 * const dag = new PopoverDAG();
 * dag.addNode('root');
 * dag.addNode('child-1', 'root');
 * dag.addNode('grandchild', 'child-1');
 *
 * const descendants = dag.getDescendantKeys('root');
 * console.log(descendants.has('grandchild')); // true
 * ```
 */
export class PopoverDAG {
  private nodes = new Map<string, DAGNode>();

  /**
   * Clears all nodes and relationships from the graph.
   */
  clear(): void {
    this.nodes.clear();
  }

  /**
   * Adds or updates a node in the DAG graph.
   * Handles reparenting: if the node already had a different parent, it cleanly detaches
   * from the old parent's child set before attaching to the new parent.
   *
   * @param key - Unique popover key.
   * @param parentKey - Optional parent popover key.
   */
  addNode(key: string, parentKey?: string): void {
    let node = this.nodes.get(key);
    if (!node) {
      node = {
        key,
        parentKey,
        childrenKeys: new Set(),
        depth: 0,
      };
      this.nodes.set(key, node);
    } else {
      // Reparenting: cleanly unlink from previous parent if it changed
      const oldParentKey = node.parentKey;
      if (oldParentKey && oldParentKey !== parentKey) {
        const oldParentNode = this.nodes.get(oldParentKey);
        if (oldParentNode) {
          oldParentNode.childrenKeys.delete(key);
        }
      }
      node.parentKey = parentKey;
    }

    // Link into parent's children set and recalculate relative depth
    if (parentKey && parentKey !== key) {
      const parentNode = this.nodes.get(parentKey);
      if (parentNode) {
        parentNode.childrenKeys.add(key);
        node.depth = parentNode.depth + 1;
      }
    }
  }

  /**
   * Removes a node from the DAG graph and cleans up parent/child references.
   */
  removeNode(key: string): void {
    const node = this.nodes.get(key);
    if (!node) return;

    if (node.parentKey) {
      const parentNode = this.nodes.get(node.parentKey);
      if (parentNode) {
        parentNode.childrenKeys.delete(key);
      }
    }

    for (const childKey of node.childrenKeys) {
      const childNode = this.nodes.get(childKey);
      if (childNode && childNode.parentKey === key) {
        childNode.parentKey = undefined;
      }
    }

    this.nodes.delete(key);
  }

  /**
   * Checks whether a node exists in the graph.
   */
  hasNode(key: string): boolean {
    return this.nodes.has(key);
  }

  /**
   * Retrieves a node from the graph.
   */
  getNode(key: string): DAGNode | undefined {
    return this.nodes.get(key);
  }

  /**
   * Returns total count of nodes in the graph.
   */
  get size(): number {
    return this.nodes.size;
  }

  /**
   * Traverses all descendant keys for a given parent key using an iterative DFS stack.
   * Mutates the provided `outSet` to achieve zero heap allocations in hot paths.
   *
   * @param parentKey - Starting root key to explore descendants for.
   * @param outSet - Output Set to collect all discovered child keys.
   * @returns Populated outSet with all descendant keys.
   */
  getDescendantKeysInto(parentKey: string, outSet: Set<string>): Set<string> {
    const stack: string[] = [parentKey];

    while (stack.length > 0) {
      const currentKey = stack.pop();
      if (!currentKey) continue;
      const node = this.nodes.get(currentKey);
      if (node) {
        for (const childKey of node.childrenKeys) {
          // Cycle protection guard: prevent re-visiting or looping back to root
          if (!outSet.has(childKey) && childKey !== parentKey) {
            outSet.add(childKey);
            stack.push(childKey);
          }
        }
      }
    }

    return outSet;
  }

  /**
   * Returns all descendant keys for a given parent key.
   *
   * @param parentKey - Starting parent key.
   * @returns Set containing all transitive children keys.
   */
  getDescendantKeys(parentKey: string): Set<string> {
    return this.getDescendantKeysInto(parentKey, new Set<string>());
  }

  /**
   * Computes a deterministic topological z-index stacking order for all active nodes.
   * Ensures parent popovers always appear under their children in the stacking order.
   * Disconnected/orphan nodes are safely appended at the end.
   *
   * @param baseZIndex - Starting base z-index depth (default: 1000).
   * @returns Map of popover keys to calculated z-index integer values.
   */
  getTopologicalZIndexOrder(baseZIndex = 1000): Map<string, number> {
    const result = new Map<string, number>();
    const visited = new Set<string>();
    let currentZIndex = baseZIndex;

    const visit = (key: string) => {
      if (visited.has(key)) return;
      visited.add(key);

      const node = this.nodes.get(key);
      if (!node) return;

      result.set(key, currentZIndex++);

      // Depth-first visit child nodes to stack them strictly above parents
      for (const childKey of node.childrenKeys) {
        visit(childKey);
      }
    };

    // Phase 1: Traverse from top-level root nodes (nodes without parents)
    for (const [key, node] of this.nodes.entries()) {
      if (!node.parentKey) {
        visit(key);
      }
    }

    // Phase 2: Traverse any orphan/island subgraphs to ensure complete coverage
    for (const [key] of this.nodes.entries()) {
      if (!visited.has(key)) {
        visit(key);
      }
    }

    return result;
  }
}
