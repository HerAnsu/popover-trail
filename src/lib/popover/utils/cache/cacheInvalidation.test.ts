import { describe, it, expect } from 'vitest';
import { SimplePopoverCache } from './SimplePopoverCache';
import type { StorageAdapter } from './cacheTypes';

describe('Cache Invalidation Policies', () => {
  it('invalidates entries by prefix', () => {
    const cache = new SimplePopoverCache<string>();
    cache.set('user:1', 'Alice');
    cache.set('user:2', 'Bob');
    cache.set('post:1', 'Hello');

    const count = cache.invalidatePrefix('user:');
    expect(count).toBe(2);
    expect(cache.has('user:1')).toBe(false);
    expect(cache.has('user:2')).toBe(false);
    expect(cache.has('post:1')).toBe(true);
  });

  it('invalidates entries by regex pattern', () => {
    const cache = new SimplePopoverCache<string>();
    cache.set('menu_item_1', 'File');
    cache.set('menu_item_2', 'Edit');
    cache.set('sidebar_1', 'Tree');

    const count = cache.invalidatePattern(/^menu_item_\d+$/);
    expect(count).toBe(2);
    expect(cache.has('menu_item_1')).toBe(false);
    expect(cache.has('menu_item_2')).toBe(false);
    expect(cache.has('sidebar_1')).toBe(true);
  });

  it('invalidates entries by tags', () => {
    const cache = new SimplePopoverCache<string>();
    const storage = (cache as unknown as { storage: StorageAdapter<string> }).storage;
    storage.set('a', { data: 'Alpha', expiry: Date.now() + 10000, tags: ['core', 'nav'] });
    storage.set('b', { data: 'Beta', expiry: Date.now() + 10000, tags: ['core'] });
    storage.set('c', { data: 'Gamma', expiry: Date.now() + 10000, tags: ['footer'] });

    const count = cache.invalidateTags('nav');
    expect(count).toBe(1);
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(true);
    expect(cache.has('c')).toBe(true);

    const countMultiple = cache.invalidateTags(['core', 'footer']);
    expect(countMultiple).toBe(2);
    expect(cache.size).toBe(0);
  });

  it('invalidates hierarchical branch using invalidateBranch', () => {
    const cache = new SimplePopoverCache<string>();
    cache.set('root', 'root-data');
    cache.set('c1', 'child-1');
    cache.set('c2', 'child-2');

    const tree: Record<string, string[]> = {
      root: ['c1', 'c2'],
      c1: [],
      c2: [],
    };

    const count = cache.invalidateBranch('root', (k) => tree[k]);
    expect(count).toBe(3);
    expect(cache.has('root')).toBe(false);
    expect(cache.has('c1')).toBe(false);
    expect(cache.has('c2')).toBe(false);
  });

  it('supports active touch on entries', () => {
    const cache = new SimplePopoverCache<string>(500);
    cache.set('key-touch', 'data');
    expect(cache.touch('key-touch', 10000)).toBe(true);
    expect(cache.touch('non-existent')).toBe(false);
  });
});
