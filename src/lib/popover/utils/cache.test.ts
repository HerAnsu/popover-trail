import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SimplePopoverCache } from './cache';

describe('SimplePopoverCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('stores and retrieves cached items before TTL expires', () => {
    const cache = new SimplePopoverCache<string>(5000, 10);
    cache.set('key1', 'payload-1');

    expect(cache.get('key1')).toBe('payload-1');
    expect(cache.has('key1')).toBe(true);
    expect(cache.size).toBe(1);
  });

  it('returns undefined for non-existent keys', () => {
    const cache = new SimplePopoverCache<string>();
    expect(cache.get('non-existent')).toBeUndefined();
    expect(cache.has('non-existent')).toBe(false);
  });

  it('evicts items after TTL expires', () => {
    const cache = new SimplePopoverCache<string>(1000, 10);
    cache.set('key1', 'payload-1');

    expect(cache.get('key1')).toBe('payload-1');

    // Advance time by 1500ms
    vi.advanceTimersByTime(1500);

    expect(cache.get('key1')).toBeUndefined();
    expect(cache.has('key1')).toBe(false);
    expect(cache.size).toBe(0);
  });

  it('evicts oldest items when maxItems limit is reached (LRU eviction)', () => {
    const cache = new SimplePopoverCache<number>(100000, 3);
    cache.set('item1', 1);
    cache.set('item2', 2);
    cache.set('item3', 3);

    expect(cache.size).toBe(3);

    // Adding 4th item should evict item1 (oldest)
    cache.set('item4', 4);

    expect(cache.size).toBe(3);
    expect(cache.has('item1')).toBe(false);
    expect(cache.has('item2')).toBe(true);
    expect(cache.has('item3')).toBe(true);
    expect(cache.has('item4')).toBe(true);
  });

  it('deletes individual keys correctly', () => {
    const cache = new SimplePopoverCache<string>();
    cache.set('a', 'alpha');
    cache.set('b', 'beta');

    cache.delete('a');
    expect(cache.has('a')).toBe(false);
    expect(cache.has('b')).toBe(true);
  });

  it('clears all cached entries', () => {
    const cache = new SimplePopoverCache<string>();
    cache.set('a', 'alpha');
    cache.set('b', 'beta');
    cache.clear();

    expect(cache.size).toBe(0);
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBeUndefined();
  });

  it('handles Promise value caching', async () => {
    const cache = new SimplePopoverCache<string | Promise<string>>();
    const promise = Promise.resolve('async-data');
    cache.set('async-key', promise);

    const cached = cache.get('async-key');
    expect(cached).toBe(promise);
    await expect(cached).resolves.toBe('async-data');
  });
});
