/**
 * Web Storage adapter for localStorage and sessionStorage persistence.
 *
 * @module cache/webStorageAdapter
 */

import type { CacheEntry, StorageAdapter } from './cacheTypes';
import { isValidStorageKey } from '../safeKeys';

function isCacheEntry<T>(val: unknown): val is CacheEntry<T> {
  return (
    typeof val === 'object' &&
    val !== null &&
    'expiry' in val &&
    typeof val.expiry === 'number'
  );
}

export class WebStorageAdapter<T = unknown> implements StorageAdapter<T> {
  private readonly prefix: string;
  private readonly storage: Storage;

  constructor(storage: Storage, prefix = 'pt_cache:') {
    this.storage = storage;
    this.prefix = prefix;
  }

  public get(key: string): CacheEntry<T> | undefined {
    if (!isValidStorageKey(key)) return undefined;
    try {
      const raw = this.storage.getItem(this.prefix + key);
      if (!raw) return undefined;
      const parsed: unknown = JSON.parse(raw);
      return isCacheEntry<T>(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }

  public set(key: string, entry: CacheEntry<T>): void {
    if (!isValidStorageKey(key)) return;
    try {
      this.storage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch {
      // Quota exceeded or serialization failure
    }
  }

  public delete(key: string): boolean {
    if (!isValidStorageKey(key)) return false;
    this.storage.removeItem(this.prefix + key);
    return true;
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
