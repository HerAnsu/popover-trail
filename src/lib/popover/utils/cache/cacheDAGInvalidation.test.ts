import { describe, expect, it } from 'vitest';
import { invalidateDAGBranch } from './cacheDAGInvalidation';
import { MemoryStorageAdapter } from './cacheStorage';

describe('invalidateDAGBranch', () => {
  it('should teardown branch in bottom-up post-order', () => {
    const storage = new MemoryStorageAdapter<string>();
    storage.set('root', { data: 'r', expiry: Date.now() + 10000 });
    storage.set('child1', { data: 'c1', expiry: Date.now() + 10000 });
    storage.set('child2', { data: 'c2', expiry: Date.now() + 10000 });
    storage.set('grandchild', { data: 'gc', expiry: Date.now() + 10000 });

    const graph: Record<string, string[]> = {
      root: ['child1', 'child2'],
      child1: ['grandchild'],
      child2: [],
      grandchild: [],
    };

    const deletedKeys: string[] = [];
    const count = invalidateDAGBranch(
      storage,
      'root',
      (k) => graph[k],
      (k) => deletedKeys.push(k),
    );

    expect(count).toBe(4);
    expect(storage.size).toBe(0);
    // Post-order verification: grandchild deleted before child1, children deleted before root
    expect(deletedKeys.indexOf('grandchild')).toBeLessThan(deletedKeys.indexOf('child1'));
    expect(deletedKeys.indexOf('child1')).toBeLessThan(deletedKeys.indexOf('root'));
    expect(deletedKeys.indexOf('child2')).toBeLessThan(deletedKeys.indexOf('root'));
  });

  it('should safely terminate on circular graph references', () => {
    const storage = new MemoryStorageAdapter<string>();
    storage.set('a', { data: '1', expiry: Date.now() + 10000 });
    storage.set('b', { data: '2', expiry: Date.now() + 10000 });

    const graph: Record<string, string[]> = {
      a: ['b'],
      b: ['a'], // cycle
    };

    const count = invalidateDAGBranch(storage, 'a', (k) => graph[k]);
    expect(count).toBe(2);
    expect(storage.size).toBe(0);
  });

  it('should ignore invalid root keys and missing children', () => {
    const storage = new MemoryStorageAdapter<string>();
    expect(invalidateDAGBranch(storage, '__proto__', () => [])).toBe(0);
    expect(invalidateDAGBranch(storage, 'nonexistent', () => undefined)).toBe(0);
  });
});
