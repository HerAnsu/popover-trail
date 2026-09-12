import { describe, it, expect, vi } from 'vitest';
import { SimplePopoverCache } from './SimplePopoverCache';

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
});
