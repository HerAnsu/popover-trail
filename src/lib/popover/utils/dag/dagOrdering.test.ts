import { describe, it, expect } from 'vitest';
import { PopoverDAG } from './dagCore';
import { safeTopologicalSort } from './dagOrdering';
import type { InternalDAGNode } from './dagTypes';

describe('PopoverDAG Ordering and Teardown Plan', () => {
  it('generates reverse topological bottom-up teardown plan', () => {
    const dag = new PopoverDAG();
    dag.addNode('root');
    dag.addNode('menu-1', 'root');
    dag.addNode('submenu-1', 'menu-1');
    dag.addNode('dialog-1', 'submenu-1');

    const teardown = dag.getTeardownPlan('root');
    // Teardown should order deepest leaves first: dialog-1, then submenu-1, then menu-1
    expect(teardown).toEqual(['dialog-1', 'submenu-1', 'menu-1']);

    const teardownWithRoot = dag.getTeardownPlan('root', true);
    expect(teardownWithRoot).toEqual(['dialog-1', 'submenu-1', 'menu-1', 'root']);
  });

  it('computes breadcrumbs from root to target node', () => {
    const dag = new PopoverDAG();
    dag.addNode('home');
    dag.addNode('settings', 'home');
    dag.addNode('security', 'settings');
    dag.addNode('2fa', 'security');

    const path = dag.getBreadcrumbs('2fa');
    expect(path).toEqual(['home', 'settings', 'security', '2fa']);
  });

  it('returns empty breadcrumbs for non-existent node', () => {
    const dag = new PopoverDAG();
    expect(dag.getBreadcrumbs('ghost')).toEqual([]);
  });

  it('safeTopologicalSort returns Ok with topological order when acyclic', () => {
    const dag = new PopoverDAG();
    dag.addNode('A');
    dag.addNode('B', 'A');
    dag.addNode('C', 'B');

    const result = dag.safeTopologicalSort();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.indexOf('A')).toBeLessThan(result.data.indexOf('B'));
      expect(result.data.indexOf('B')).toBeLessThan(result.data.indexOf('C'));
    }
  });

  it('supports addEdge with DAGEdge object interface and queries edges', () => {
    const dag = new PopoverDAG();
    dag.addNode('p1');
    dag.addNode('c1');
    const added = dag.addEdge({ from: 'p1', to: 'c1' });
    expect(added).toBe(true);

    const edges = dag.getEdges();
    expect(edges).toEqual([{ from: 'p1', to: 'c1' }]);
    expect(Object.isFrozen(edges)).toBe(true);
  });

  it('queries roots, leaves, and max depth', () => {
    const dag = new PopoverDAG();
    dag.addNode('root1');
    dag.addNode('root2');
    dag.addNode('mid', 'root1');
    dag.addEdge({ from: 'root2', to: 'mid' });
    dag.addNode('leaf', 'mid');

    expect(dag.getRoots()).toEqual(['root1', 'root2']);
    expect(dag.getLeaves()).toEqual(['leaf']);
    expect(dag.getMaxDepth()).toBe(2);
  });

  it('safeTopologicalSort returns Err with DAGCycleError when cycle exists', () => {
    const nodes = new Map<string, InternalDAGNode<string>>();
    nodes.set('A', {
      key: 'A',
      parentKeys: new Set(['B']),
      childrenKeys: new Set(['B']),
      depth: 0,
    });
    nodes.set('B', {
      key: 'B',
      parentKeys: new Set(['A']),
      childrenKeys: new Set(['A']),
      depth: 1,
    });

    const result = safeTopologicalSort(nodes);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('DAG_CYCLE_ERROR');
      expect(result.error.cycleKeys).toContain('A');
      expect(result.error.cycleKeys).toContain('B');
    }
  });
});
