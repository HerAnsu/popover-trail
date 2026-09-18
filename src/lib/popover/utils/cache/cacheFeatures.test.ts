import { describe, it, expect, vi } from 'vitest';
import { SimplePopoverCache } from './SimplePopoverCache';
import { getCacheEntryState } from './cacheCoreOperations';
import type { CacheEntry } from './cacheTypes';
import { toCacheKey, isCacheKey } from '../brandedStrings';

describe('Advanced Cache Features', () => {
  it('emits evict event on LRU eviction', () => {
    const cache = new SimplePopoverCache<string>(60000, 2);
    const evictSpy = vi.fn();
    cache.on('evict', evictSpy);

    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3'); // causes 'a' to be evicted

    expect(evictSpy).toHaveBeenCalledWith({ key: 'a', reason: 'lru' });
    expect(cache.has('a')).toBe(false);
  });

  it('supports periodic polling via poll method', async () => {
    vi.useFakeTimers();
    const cache = new SimplePopoverCache<number>(60000, 10);
    let counter = 0;
    const fetcher = vi.fn(async () => ++counter);

    const stop = cache.poll('pollKey', 1000, fetcher);
    expect(cache.get('pollKey')).toBeUndefined();

    await vi.advanceTimersByTimeAsync(1050);
    expect(cache.get('pollKey')).toBe(1);

    await vi.advanceTimersByTimeAsync(1050);
    expect(cache.get('pollKey')).toBe(2);

    stop();
    await vi.advanceTimersByTimeAsync(2000);
    expect(cache.get('pollKey')).toBe(2);
    vi.useRealTimers();
  });

  it('evaluates cache entry discrete temporal states (fresh, stale, expired)', () => {
    const now = 10000;
    const freshEntry: CacheEntry<string> = {
      data: 'val',
      expiry: now + 5000,
      staleAt: now + 2000,
    };
    const staleEntry: CacheEntry<string> = {
      data: 'val',
      expiry: now + 5000,
      staleAt: now - 100,
    };
    const expiredEntry: CacheEntry<string> = {
      data: 'val',
      expiry: now - 100,
      staleAt: now - 200,
    };

    expect(getCacheEntryState(freshEntry, now).status).toBe('fresh');
    expect(getCacheEntryState(staleEntry, now).status).toBe('stale');
    expect(getCacheEntryState(expiredEntry, now).status).toBe('expired');
  });

  it('validates branded CacheKey using smart constructor', () => {
    const key = toCacheKey('user:123');
    expect(isCacheKey(key)).toBe(true);
    expect(isCacheKey('')).toBe(false);
    expect(isCacheKey(123)).toBe(false);
    expect(() => toCacheKey('')).toThrow(TypeError);
  });
});
