import { describe, it, expect } from 'vitest';
import { PopoverDAG } from './dagCore';

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

  it('computes geodesic path from root to target node for breadcrumbs', () => {
    const dag = new PopoverDAG();
    dag.addNode('home');
    dag.addNode('settings', 'home');
    dag.addNode('security', 'settings');
    dag.addNode('2fa', 'security');

    const path = dag.getGeodesicPath('2fa');
    expect(path).toEqual(['home', 'settings', 'security', '2fa']);
  });

  it('returns empty geodesic path for non-existent node', () => {
    const dag = new PopoverDAG();
    expect(dag.getGeodesicPath('ghost')).toEqual([]);
  });
});
