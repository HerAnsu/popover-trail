/**
 * Two-tier storage adapter combining fast L1 memory with L2 persistence.
 *
 * @module cache/cacheTieredStorage
 */

import type { CacheEntry, StorageAdapter } from './cacheTypes';
import { MemoryStorageAdapter } from './cacheStorage';

export interface TieredStorageOptions<T = unknown> {
  readonly l1?: StorageAdapter<T>;
  readonly l2: StorageAdapter<T>;
  readonly shouldPromote?: (key: string, entry: CacheEntry<T>) => boolean;
}

export class TieredStorageAdapter<T = unknown> implements StorageAdapter<T> {
  private readonly l1: StorageAdapter<T>;
  private readonly l2: StorageAdapter<T>;
  private readonly shouldPromote?: (key: string, entry: CacheEntry<T>) => boolean;

  constructor(options: TieredStorageOptions<T>) {
    this.l1 = options.l1 ?? new MemoryStorageAdapter<T>();
    this.l2 = options.l2;
    this.shouldPromote = options.shouldPromote;
  }

  public get(key: string): CacheEntry<T> | undefined {
    const l1Entry = this.l1.get(key);
    if (l1Entry) return l1Entry;

    const l2Entry = this.l2.get(key);
    if (!l2Entry) return undefined;

    if (Date.now() > l2Entry.expiry) {
      this.l2.delete(key);
      return undefined;
    }

    if (!this.shouldPromote || this.shouldPromote(key, l2Entry)) {
      this.l1.set(key, l2Entry);
    }
    return l2Entry;
  }

  public set(key: string, entry: CacheEntry<T>): void {
    this.l1.set(key, entry);
    this.l2.set(key, entry);
  }

  public delete(key: string): boolean {
    const d1 = this.l1.delete(key);
    const d2 = this.l2.delete(key);
    return d1 || d2;
  }

  public clear(): void {
    this.l1.clear();
    this.l2.clear();
  }

  public *keys(): Iterable<string> {
    const seen = new Set<string>();
    for (const key of this.l1.keys()) {
      seen.add(key);
      yield key;
    }
    for (const key of this.l2.keys()) {
      if (!seen.has(key)) yield key;
    }
  }

  public *entries(): Iterable<[string, CacheEntry<T>]> {
    const seen = new Set<string>();
    for (const [key, entry] of this.l1.entries()) {
      seen.add(key);
      yield [key, entry];
    }
    for (const [key, entry] of this.l2.entries()) {
      if (!seen.has(key)) yield [key, entry];
    }
  }

  public get size(): number {
    return new Set<string>([...this.l1.keys(), ...this.l2.keys()]).size;
  }
}
