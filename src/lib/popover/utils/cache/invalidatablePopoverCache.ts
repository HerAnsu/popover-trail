/**
 * Intermediate cache layer providing prefix, pattern, branch, and tag invalidations.
 *
 * @module cache/invalidatablePopoverCache
 */

import type { CacheSetOptions } from './cacheTypes';
import { BasePopoverCache } from './basePopoverCache';
import {
  invalidateByPattern,
  invalidateByPrefix,
  invalidateByTags,
  pruneExpiredEntries,
} from './cacheInvalidation';
import { CacheTagIndex, invalidateWithTagIndex } from './cacheTagIndex';
import { invalidateDAGBranch } from './cacheDAGInvalidation';
import { touchCacheEntry, type TouchOptions } from './cacheSlidingExpiration';

export class InvalidatablePopoverCache<TData = unknown> extends BasePopoverCache<TData> {
  public get capacity(): number {
    return this.maxSize;
  }
  protected readonly tagIndex = new CacheTagIndex();

  public override set(key: string, data: TData, opts?: number | CacheSetOptions): void {
    super.set(key, data, opts);
    if (typeof opts === 'object' && opts !== null && opts.tags) {
      this.tagIndex.register(key, opts.tags);
    }
  }

  public override delete(key: string): boolean {
    this.tagIndex.unregister(key);
    return super.delete(key);
  }

  public override clear(): void {
    this.tagIndex.clear();
    super.clear();
  }

  public pruneExpired(): number {
    return pruneExpiredEntries(this.storage);
  }

  public invalidatePrefix(prefix: string): number {
    return invalidateByPrefix(this.storage, prefix);
  }

  public invalidatePattern(regex: RegExp): number {
    return invalidateByPattern(this.storage, regex);
  }

  public invalidateTags(tags: string | readonly string[]): number {
    const res = invalidateWithTagIndex(this.storage, this.tagIndex, tags, (k) =>
      this.emitInvalidation(k),
    );
    if (res > 0) return res;
    return invalidateByTags(this.storage, typeof tags === 'string' ? [tags] : tags);
  }

  public invalidateBranch(
    rootKey: string,
    getChildren: (key: string) => Iterable<string> | readonly string[] | undefined,
  ): number {
    return invalidateDAGBranch(this.storage, rootKey, getChildren, (k) => {
      this.tagIndex.unregister(k);
      this.emitInvalidation(k);
    });
  }

  public touch(key: string, opts?: number | TouchOptions): boolean {
    return touchCacheEntry(this.storage, key, opts ?? this.ttl);
  }
}
