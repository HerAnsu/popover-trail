import { describe, it, expect } from 'vitest';
import { usePopoverCache } from './usePopoverCache';
import { SimplePopoverCache } from '../utils/cache';

describe('usePopoverCache hook', () => {
  it('exports usePopoverCache hook function', () => {
    expect(typeof usePopoverCache).toBe('function');
  });

  it('provides safe operations when custom cache is passed', () => {
    const cache = new SimplePopoverCache<string>();
    cache.set('user:1', 'Alice');

    expect(cache.get('user:1')).toBe('Alice');

    const updated = cache.mutate('user:1', () => 'Bob');
    expect(updated).toBe('Bob');
    expect(cache.get('user:1')).toBe('Bob');

    cache.invalidatePrefix('user:');
    expect(cache.get('user:1')).toBeUndefined();
  });
});
