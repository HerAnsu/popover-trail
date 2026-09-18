import { describe, it, expect } from 'vitest';
import { SimplePopoverCache } from './SimplePopoverCache';

describe('Cache Snapshot and Restoration', () => {
  it('dumps and restores cache state accurately', () => {
    const cache1 = new SimplePopoverCache<string>(60000, 100);
    cache1.set('a', 'alpha');
    cache1.set('b', 'beta');

    const dump = cache1.dump();
    expect(dump).toHaveLength(2);

    const cache2 = new SimplePopoverCache<string>(60000, 100);
    const restored = cache2.restore(dump);
    expect(restored).toBe(2);
    expect(cache2.get('a')).toBe('alpha');
    expect(cache2.get('b')).toBe('beta');
  });

  it('rejects prototype pollution attempts during restore', () => {
    const cache = new SimplePopoverCache<unknown>(60000, 100);
    const maliciousPayload = [
      ['__proto__', { data: 'hacked', expiry: Date.now() + 10000 }],
      ['constructor', { data: 'hacked', expiry: Date.now() + 10000 }],
      ['prototype', { data: 'hacked', expiry: Date.now() + 10000 }],
      ['legit', { data: 'safe', expiry: Date.now() + 10000 }],
    ];

    const count = cache.restore(maliciousPayload);
    expect(count).toBe(1);
    expect(cache.get('legit')).toBe('safe');
    expect(cache.has('__proto__')).toBe(false);
    expect(cache.has('constructor')).toBe(false);
  });

  it('drops expired entries during restore', () => {
    const cache = new SimplePopoverCache<string>(60000, 100);
    const payload = [
      ['expiredKey', { data: 'stale', expiry: Date.now() - 5000 }],
      ['validKey', { data: 'fresh', expiry: Date.now() + 10000 }],
    ];

    const count = cache.restore(payload);
    expect(count).toBe(1);
    expect(cache.has('expiredKey')).toBe(false);
    expect(cache.get('validKey')).toBe('fresh');
  });
});
