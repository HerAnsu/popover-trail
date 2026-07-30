/**
 * Represents a single node inside the popover hierarchy graph.
 */
export interface DAGNode {
  key: string;
  parentKey?: string;
  childrenKeys: Set<string>;
  depth: number;
}

/**
 * Directed Acyclic Graph (DAG) Kernel for popover-trail.
 * Manages parent-child relationship hierarchies, cycle prevention, and topological z-index sorting.
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
   * Clears the graph.
   */
  clear(): void {
    this.nodes.clear();
  }

  /**
   * Adds or updates a node in the DAG graph.
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
      node.parentKey = parentKey;
    }

    if (parentKey) {
      const parentNode = this.nodes.get(parentKey);
      if (parentNode) {
        parentNode.childrenKeys.add(key);
        node.depth = parentNode.depth + 1;
      }
    }
  }

  /**
   * Returns all descendant keys for a given parent key.
   */
  getDescendantKeys(parentKey: string): Set<string> {
    const descendants = new Set<string>();
    const queue: string[] = [parentKey];
    const visited = new Set<string>([parentKey]);

    let head = 0;
    while (head < queue.length) {
      const currentKey = queue[head++];
      if (!currentKey) continue;
      const node = this.nodes.get(currentKey);
      if (node) {
        for (const childKey of node.childrenKeys) {
          if (!visited.has(childKey)) {
            visited.add(childKey);
            descendants.add(childKey);
            queue.push(childKey);
          }
        }
      }
    }

    return descendants;
  }

  /**
   * Returns topological z-index ordering for nodes in the graph.
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

      for (const childKey of node.childrenKeys) {
        visit(childKey);
      }
    };

    for (const key of this.nodes.keys()) {
      const node = this.nodes.get(key);
      if (node && !node.parentKey) {
        visit(key);
      }
    }

    // Fallback pass for any orphan or disconnected nodes
    for (const key of this.nodes.keys()) {
      if (!visited.has(key)) {
        visit(key);
      }
    }

    return result;
  }
}
