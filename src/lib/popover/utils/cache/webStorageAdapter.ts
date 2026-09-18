/**
 * Web Storage adapter for localStorage and sessionStorage persistence.
 *
 * @module cache/webStorageAdapter
 */

import type { CacheEntry, StorageAdapter } from './cacheTypes';
import { isValidStorageKey } from '../safeKeys';
import { ensureSuffix } from '../stringUtils';
import { fromThrowable } from '../result';

function isCacheEntry<T>(val: unknown): val is CacheEntry<T> {
  return (
    typeof val === 'object' && val !== null && 'expiry' in val && typeof val.expiry === 'number'
  );
}

/**
 * Storage adapter backed by browser Web Storage (`localStorage` or `sessionStorage`).
 * Automatically handles JSON serialization, error recovery, key prefixing, and isolation.
 *
 * @template T - Type of cached payload.
 *
 * @example
 * ```typescript
 * const adapter = new WebStorageAdapter<UserData>(window.localStorage, 'my_app_cache:');
 * adapter.set('user_123', { data: { name: 'Alice' }, expiry: Date.now() + 60000 });
 * const cached = adapter.get('user_123');
 * ```
 */
export class WebStorageAdapter<T = unknown> implements StorageAdapter<T> {
  private readonly prefix: string;
  private readonly storage: Storage;

  /**
   * Creates a new WebStorageAdapter.
   *
   * @param storage - Underlying web storage instance (e.g. `localStorage`).
   * @param prefix - Key prefix to isolate cache entries from other local storage data.
   */
  constructor(storage: Storage, prefix = 'pt_cache:') {
    this.storage = storage;
    this.prefix = ensureSuffix(prefix, ':');
  }


  public get(key: string): CacheEntry<T> | undefined {
    if (!isValidStorageKey(key)) return undefined;
    const rawRes = fromThrowable(() => this.storage.getItem(this.prefix + key));
    if (!rawRes.success || !rawRes.data) return undefined;
    try {
      const parsed: unknown = JSON.parse(rawRes.data);
      return isCacheEntry<T>(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }


  public set(key: string, entry: CacheEntry<T>): void {
    if (!isValidStorageKey(key)) return;
    fromThrowable(() => {
      this.storage.setItem(this.prefix + key, JSON.stringify(entry));
    });
  }

  public delete(key: string): boolean {
    if (!isValidStorageKey(key)) return false;
    return fromThrowable(() => this.storage.removeItem(this.prefix + key)).success;
  }


  public clear(): void {
    const keysToRemove = [...this.keys()];
    for (const key of keysToRemove) {
      this.storage.removeItem(this.prefix + key);
    }
  }

  public *keys(): Iterable<string> {
    for (let i = 0; i < this.storage.length; i++) {
      const fullKey = this.storage.key(i);
      if (fullKey && fullKey.startsWith(this.prefix)) {
        yield fullKey.slice(this.prefix.length);
      }
    }
  }

  public *entries(): Iterable<[string, CacheEntry<T>]> {
    for (const key of this.keys()) {
      const entry = this.get(key);
      if (entry) yield [key, entry];
    }
  }

  public get size(): number {
    let count = 0;
    for (let i = 0; i < this.storage.length; i++) {
      const k = this.storage.key(i);
      if (k && k.startsWith(this.prefix)) count++;
    }
    return count;
  }
}
