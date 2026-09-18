import { describe, expect, it } from 'vitest';
import { touchCacheEntry } from './cacheSlidingExpiration';
import { MemoryStorageAdapter } from './cacheStorage';

describe('touchCacheEntry', () => {
  it('should extend expiry of active entry', () => {
    const storage = new MemoryStorageAdapter<string>();
    const initialExpiry = Date.now() + 1000;
    storage.set('card-1', { data: 'hello', expiry: initialExpiry });

    const touched = touchCacheEntry(storage, 'card-1', 5000);
    expect(touched).toBe(true);

    const updated = storage.get('card-1');
    expect(updated?.expiry).toBeGreaterThan(initialExpiry);
    expect(updated?.data).toBe('hello');
  });

  it('should return false and prune expired entries', () => {
    const storage = new MemoryStorageAdapter<string>();
    storage.set('expired', { data: 'dead', expiry: Date.now() - 50 });

    const touched = touchCacheEntry(storage, 'expired', 5000);
    expect(touched).toBe(false);
    expect(storage.get('expired')).toBeUndefined();
  });

  it('should respect maxLifetimeMs restriction', () => {
    const storage = new MemoryStorageAdapter<string>();
    const now = Date.now();
    storage.set('capped', {
      data: 'data',
      createdAt: now - 3000,
      expiry: now + 500,
    });

    // Max lifetime 3200ms -> remaining allowed is 200ms
    const touched = touchCacheEntry(storage, 'capped', {
      extensionMs: 10000,
      maxLifetimeMs: 3200,
    });
    expect(touched).toBe(true);
    const updated = storage.get('capped');
    expect(updated?.expiry).toBeLessThanOrEqual(now + 250);

    // Max lifetime already exceeded
    const expiredTouch = touchCacheEntry(storage, 'capped', {
      extensionMs: 10000,
      maxLifetimeMs: 2000,
    });
    expect(expiredTouch).toBe(false);
    expect(storage.get('capped')).toBeUndefined();
  });

  it('should safely reject invalid keys', () => {
    const storage = new MemoryStorageAdapter<string>();
    expect(touchCacheEntry(storage, '__proto__', 1000)).toBe(false);
  });
});
