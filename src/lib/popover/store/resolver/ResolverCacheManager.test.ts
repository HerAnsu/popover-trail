import { describe, it, expect } from 'vitest';
import { ResolverCacheManager } from './ResolverCacheManager';
import { SimplePopoverCache } from '../../utils/cache';

describe('ResolverCacheManager Invalidation Routines', () => {
  it('invalidates prefix, pattern, and tags across wrapped cache', () => {
    const cache = new SimplePopoverCache<string>();
    const manager = new ResolverCacheManager(cache);

    cache.set('popover:1', 'Data 1');
    cache.set('popover:2', 'Data 2');
    cache.set('dialog:1', 'Dialog 1');

    manager.invalidatePrefix('popover:');
    expect(manager.readSync('popover:1')).toBeUndefined();
    expect(manager.readSync('popover:2')).toBeUndefined();
    expect(manager.readSync('dialog:1')).toBe('Dialog 1');

    manager.invalidatePattern(/^dialog:/);
    expect(manager.readSync('dialog:1')).toBeUndefined();
  });

  it('cascades branch invalidation down DAG descendants', () => {
    const cache = new SimplePopoverCache<string>();
    const manager = new ResolverCacheManager(cache);

    cache.set('root', 'Root');
    cache.set('child1', 'Child 1');
    cache.set('child2', 'Child 2');
    cache.set('other', 'Other');

    const getDescendants = (key: string) => (key === 'root' ? ['child1', 'child2'] : []);

    manager.invalidateBranch('root', getDescendants);

    expect(manager.readSync('root')).toBeUndefined();
    expect(manager.readSync('child1')).toBeUndefined();
    expect(manager.readSync('child2')).toBeUndefined();
    expect(manager.readSync('other')).toBe('Other');
  });
});
