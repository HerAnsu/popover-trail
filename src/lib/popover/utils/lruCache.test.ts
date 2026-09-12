import { describe, it, expect } from 'vitest';
import { createLRUCache } from './lruCache';

describe('createLRUCache', () => {
  it('stores and retrieves values', () => {
    const cache = createLRUCache<string, number>(3);
    cache.set('a', 1);
    cache.set('b', 2);
    expect(cache.get('a')).toBe(1);
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBeUndefined();
  });

  it('evicts least recently used item when capacity is exceeded', () => {
    const cache = createLRUCache<string, number>(2);
    cache.set('a', 1);
    cache.set('b', 2);
    cache.get('a'); // 'a' accessed, so 'b' becomes least recently used
    cache.set('c', 3); // should evict 'b'

    expect(cache.has('a')).toBe(true);
    expect(cache.has('c')).toBe(true);
    expect(cache.has('b')).toBe(false);
    expect(cache.size).toBe(2);
  });

  it('clears all items on clear()', () => {
    const cache = createLRUCache<string, number>(2);
    cache.set('a', 1);
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get('a')).toBeUndefined();
  });
});
