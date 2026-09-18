import { describe, it, expect, vi } from 'vitest';
import { CacheTagIndex, invalidateWithTagIndex } from './cacheTagIndex';

describe('CacheTagIndex', () => {
  it('registers and looks up keys by tag', () => {
    const index = new CacheTagIndex();
    index.register('card-1', ['user', 'profile']);
    index.register('card-2', ['user', 'settings']);
    index.register('card-3', ['admin']);

    expect(index.getKeysForTag('user')).toEqual(new Set(['card-1', 'card-2']));
    expect(index.getKeysForTag('profile')).toEqual(new Set(['card-1']));
    expect(index.getKeysForTags(['profile', 'admin'])).toEqual(new Set(['card-1', 'card-3']));
  });

  it('unregisters keys and updates inverted mapping', () => {
    const index = new CacheTagIndex();
    index.register('item-1', ['groupA']);
    index.register('item-2', ['groupA', 'groupB']);

    index.unregister('item-1');
    expect(index.getKeysForTag('groupA')).toEqual(new Set(['item-2']));

    index.unregister('item-2');
    expect(index.getKeysForTag('groupA')).toBeUndefined();
    expect(index.getKeysForTag('groupB')).toBeUndefined();
  });

  it('invalidates matching keys via invalidateWithTagIndex', () => {
    const index = new CacheTagIndex();
    index.register('k1', ['tagA']);
    index.register('k2', ['tagA']);
    index.register('k3', ['tagB']);

    const storage = new Map<string, string>([
      ['k1', 'v1'],
      ['k2', 'v2'],
      ['k3', 'v3'],
    ]);
    const deleteSpy = vi.fn();

    const count = invalidateWithTagIndex(
      { delete: (k) => storage.delete(k) },
      index,
      'tagA',
      deleteSpy,
    );

    expect(count).toBe(2);
    expect(deleteSpy).toHaveBeenCalledWith('k1');
    expect(deleteSpy).toHaveBeenCalledWith('k2');
    expect(storage.has('k1')).toBe(false);
    expect(storage.has('k2')).toBe(false);
    expect(storage.has('k3')).toBe(true);
  });
});
