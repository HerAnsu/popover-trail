import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SimplePopoverCache } from './cache';

describe('SimplePopoverCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it('supports custom per-entry TTL override in set(key, data, ttlMs)', () => {
    const cache = new SimplePopoverCache<string>(5000, 10); // default 5s
    cache.set('short-lived', 'data', 500); // custom 500ms TTL

    expect(cache.get('short-lived')).toBe('data');

    vi.advanceTimersByTime(600);
    expect(cache.get('short-lived')).toBeUndefined();
  });

  it('evicts oldest items when maxItems limit is reached (True LRU eviction)', () => {
    const cache = new SimplePopoverCache<number>(100000, 3);
    cache.set('item1', 1);
    cache.set('item2', 2);
    cache.set('item3', 3);

    expect(cache.size).toBe(3);

    // Access item1 to mark it as recently used (should move to end of LRU queue)
    expect(cache.get('item1')).toBe(1);

    // Adding 4th item should now evict item2 (since item1 was accessed recently)
    cache.set('item4', 4);

    expect(cache.size).toBe(3);
    expect(cache.has('item1')).toBe(true);
    expect(cache.has('item2')).toBe(false); // item2 evicted!
    expect(cache.has('item3')).toBe(true);
    expect(cache.has('item4')).toBe(true);
  });

  it('prioritizes evicting expired items before evicting fresh items when reaching capacity', () => {
    const cache = new SimplePopoverCache<number>(500, 3);
    cache.set('fresh1', 1, 10000); // expires in 10s
    cache.set('expired2', 2, 200); // expires in 200ms
    cache.set('fresh3', 3, 10000); // expires in 10s

    vi.advanceTimersByTime(300); // expired2 is now expired

    // Adding 4th item at capacity should prune expired2 instead of fresh1
    cache.set('fresh4', 4, 10000);

    expect(cache.size).toBe(3);
    expect(cache.has('fresh1')).toBe(true);
    expect(cache.has('expired2')).toBe(false);
    expect(cache.has('fresh3')).toBe(true);
    expect(cache.has('fresh4')).toBe(true);
  });

  it('deletes individual keys correctly', () => {
    const cache = new SimplePopoverCache<string>();
    cache.set('a', 'alpha');
    cache.set('b', 'beta');

    expect(cache.delete('a')).toBe(true);
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

  it('handles Promise value caching and auto-purges rejected promises', async () => {
    const cache = new SimplePopoverCache<Promise<string>>();
    const okPromise = Promise.resolve('async-data');
    cache.set('async-ok', okPromise);

    expect(cache.get('async-ok')).toBe(okPromise);
    await expect(cache.get('async-ok')).resolves.toBe('async-data');

    // Rejected promise
    const failPromise = Promise.reject(new Error('Network boom'));
    cache.set('async-fail', failPromise);

    await expect(failPromise).rejects.toThrow('Network boom');
    expect(cache.has('async-fail')).toBe(false); // Automatically removed after rejection!
  });

  it('safely handles empty or prototype pollution keys and tracks stats', () => {
    const cache = new SimplePopoverCache<string>();
    expect(cache.get('')).toBeUndefined();
    expect(cache.has('')).toBe(false);
    cache.set('', 'invalid');
    cache.set('__proto__', 'polluted');
    cache.delete('');
    expect(cache.size).toBe(0);

    cache.set('valid', 'data');
    expect(cache.get('valid')).toBe('data');
    expect(cache.get('missing')).toBeUndefined();

    const stats = cache.stats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.hitRatio).toBe(0.5);

    expect(() => cache.dispose()).not.toThrow();
  });

  it('prunes expired items via pruneExpired()', () => {
    const cache = new SimplePopoverCache<string>(300);
    cache.set('item1', 'val1');
    cache.set('item2', 'val2');

    vi.advanceTimersByTime(400);
    expect(cache.pruneExpired()).toBe(2);
    expect(cache.size).toBe(0);
  });
});
