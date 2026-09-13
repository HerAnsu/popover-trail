import { describe, it, expect, vi } from 'vitest';
import { SimplePopoverCache } from './SimplePopoverCache';
import { sleep } from '../asyncUtils';

describe('Cache SWR & Reactivity Engine', () => {
  it('deduplicates concurrent fetches with getOrSet', async () => {
    const cache = new SimplePopoverCache<string>();
    const fetcher = vi.fn(async () => {
      await sleep(10);
      return 'fetched-data';
    });

    const [res1, res2] = await Promise.all([
      cache.getOrSet('key1', fetcher),
      cache.getOrSet('key1', fetcher),
    ]);

    expect(res1).toBe('fetched-data');
    expect(res2).toBe('fetched-data');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('notifies subscribers and emits events on lifecycle changes', () => {
    const cache = new SimplePopoverCache<string>();
    const listener = vi.fn();
    const hitListener = vi.fn();

    const unsub = cache.subscribe('user:1', listener);
    cache.on('hit', hitListener);

    cache.set('user:1', 'Alice');
    expect(listener).toHaveBeenCalledWith('Alice');

    const value = cache.get('user:1');
    expect(value).toBe('Alice');
    expect(hitListener).toHaveBeenCalledWith({ key: 'user:1', value: 'Alice' });

    cache.delete('user:1');
    expect(listener).toHaveBeenCalledWith(undefined);

    unsub();
  });

  it('mutates cached values optimistically', () => {
    const cache = new SimplePopoverCache<number>();
    cache.set('count', 10);

    const updated = cache.mutate('count', (prev) => (prev ?? 0) + 5);
    expect(updated).toBe(15);
    expect(cache.get('count')).toBe(15);
  });
});
