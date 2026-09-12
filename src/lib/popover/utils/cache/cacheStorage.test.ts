import { describe, it, expect } from 'vitest';
import { WebStorageAdapter } from './webStorageAdapter';
import { MemoryStorageAdapter } from './cacheStorage';

describe('Storage Adapters', () => {
  it('MemoryStorageAdapter stores and deletes entries properly', () => {
    const mem = new MemoryStorageAdapter<string>();
    mem.set('k1', { data: 'v1', expiry: 1000 });
    expect(mem.get('k1')?.data).toBe('v1');
    expect(mem.size).toBe(1);
    expect(mem.delete('k1')).toBe(true);
    expect(mem.size).toBe(0);
  });

  it('WebStorageAdapter serializes and iterates storage keys', () => {
    const store = new Map<string, string>();
    const mockStorage: Storage = {
      getItem: (k) => store.get(k) ?? null,
      setItem: (k, v) => {
        store.set(k, v);
      },
      removeItem: (k) => {
        store.delete(k);
      },
      clear: () => store.clear(),
      key: (i) => [...store.keys()][i] ?? null,
      get length() {
        return store.size;
      },
    };

    const adapter = new WebStorageAdapter<string>(mockStorage, 'test:');
    adapter.set('k1', { data: 'val1', expiry: 5000 });
    expect(adapter.get('k1')?.data).toBe('val1');
    expect([...adapter.keys()]).toEqual(['k1']);
    expect(adapter.size).toBe(1);

    adapter.delete('k1');
    expect(adapter.get('k1')).toBeUndefined();
    expect(adapter.size).toBe(0);
  });
});
