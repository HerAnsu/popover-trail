import { describe, expect, it } from 'vitest';
import { TieredStorageAdapter } from './cacheTieredStorage';
import { MemoryStorageAdapter } from './cacheStorage';

describe('TieredStorageAdapter', () => {
  it('should write to both L1 and L2, and read from L1 fast path', () => {
    const l1 = new MemoryStorageAdapter<string>();
    const l2 = new MemoryStorageAdapter<string>();
    const tiered = new TieredStorageAdapter<string>({ l1, l2 });

    tiered.set('user-1', { data: 'Alice', expiry: Date.now() + 5000 });

    expect(l1.get('user-1')?.data).toBe('Alice');
    expect(l2.get('user-1')?.data).toBe('Alice');
    expect(tiered.get('user-1')?.data).toBe('Alice');
  });

  it('should promote L2 entry to L1 on L1 miss', () => {
    const l1 = new MemoryStorageAdapter<string>();
    const l2 = new MemoryStorageAdapter<string>();
    const tiered = new TieredStorageAdapter<string>({ l1, l2 });

    l2.set('item-2', { data: 'Bob', expiry: Date.now() + 5000 });
    expect(l1.get('item-2')).toBeUndefined();

    const entry = tiered.get('item-2');
    expect(entry?.data).toBe('Bob');
    expect(l1.get('item-2')?.data).toBe('Bob');
  });

  it('should not promote expired L2 entries', () => {
    const l1 = new MemoryStorageAdapter<string>();
    const l2 = new MemoryStorageAdapter<string>();
    const tiered = new TieredStorageAdapter<string>({ l1, l2 });

    l2.set('expired-item', { data: 'Old', expiry: Date.now() - 100 });
    expect(tiered.get('expired-item')).toBeUndefined();
    expect(l1.get('expired-item')).toBeUndefined();
    expect(l2.get('expired-item')).toBeUndefined();
  });

  it('should respect shouldPromote predicate', () => {
    const l1 = new MemoryStorageAdapter<string>();
    const l2 = new MemoryStorageAdapter<string>();
    const tiered = new TieredStorageAdapter<string>({
      l1,
      l2,
      shouldPromote: (key) => key.startsWith('promotable:'),
    });

    l2.set('promotable:1', { data: 'Yes', expiry: Date.now() + 5000 });
    l2.set('no-promote:2', { data: 'No', expiry: Date.now() + 5000 });

    expect(tiered.get('promotable:1')?.data).toBe('Yes');
    expect(l1.get('promotable:1')?.data).toBe('Yes');

    expect(tiered.get('no-promote:2')?.data).toBe('No');
    expect(l1.get('no-promote:2')).toBeUndefined();
  });

  it('should correctly delete, clear, and report unique keys and size', () => {
    const l1 = new MemoryStorageAdapter<string>();
    const l2 = new MemoryStorageAdapter<string>();
    const tiered = new TieredStorageAdapter<string>({ l1, l2 });

    tiered.set('k1', { data: 'v1', expiry: Date.now() + 5000 });
    l2.set('k2', { data: 'v2', expiry: Date.now() + 5000 });

    expect(tiered.size).toBe(2);
    expect([...tiered.keys()]).toEqual(expect.arrayContaining(['k1', 'k2']));
    expect([...tiered.entries()]).toHaveLength(2);

    expect(tiered.delete('k1')).toBe(true);
    expect(tiered.size).toBe(1);

    tiered.clear();
    expect(tiered.size).toBe(0);
    expect(l1.size).toBe(0);
    expect(l2.size).toBe(0);
  });
});
