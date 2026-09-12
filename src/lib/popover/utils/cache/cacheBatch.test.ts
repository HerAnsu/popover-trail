import { describe, it, expect } from 'vitest';
import { SimplePopoverCache } from './SimplePopoverCache';

describe('Cache Batch Operations', () => {
  it('handles batch setMany, getMany, and deleteMany', () => {
    const cache = new SimplePopoverCache<string>(60000, 100);

    cache.setMany([
      ['k1', 'val1'],
      ['k2', 'val2', 5000],
      ['k3', 'val3'],
    ]);

    const retrieved = cache.getMany(['k1', 'k2', 'k3', 'non-existent']);
    expect(retrieved.get('k1')).toBe('val1');
    expect(retrieved.get('k2')).toBe('val2');
    expect(retrieved.get('k3')).toBe('val3');
    expect(retrieved.has('non-existent')).toBe(false);

    const deletedCount = cache.deleteMany(['k1', 'k3', 'non-existent']);
    expect(deletedCount).toBe(2);
    expect(cache.has('k1')).toBe(false);
    expect(cache.has('k3')).toBe(false);
    expect(cache.has('k2')).toBe(true);
  });
});
