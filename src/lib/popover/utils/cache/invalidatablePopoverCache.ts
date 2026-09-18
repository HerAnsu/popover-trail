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

/**
 * Intermediate cache layer providing prefix, pattern, DAG branch, and tag-based invalidations.
 *
 * @template TData - Type of cached payload.
 *
 * @example
 * ```typescript
 * const cache = new InvalidatablePopoverCache({ ttl: 60000 });
 * cache.set('users:1', { name: 'Alice' }, { tags: ['users'] });
 * cache.set('users:2', { name: 'Bob' }, { tags: ['users'] });
 * cache.invalidateTags(['users']); // invalidates both entries
 * ```
 */
export class InvalidatablePopoverCache<TData = unknown> extends BasePopoverCache<TData> {
  /** Maximum number of entries this cache can hold before evicting least-recently used. */
  public get capacity(): number {
    return this.maxSize;
  }
  protected readonly tagIndex = new CacheTagIndex();

  /**
   * Stores a value in cache and indexes optional tags for group invalidation.
   *
   * @param key - Unique cache key.
   * @param data - Payload value.
   * @param opts - Number (TTL) or options object containing `tags` and `staleWhileRevalidate`.
   */
  public override set(key: string, data: TData, opts?: number | CacheSetOptions): void {
    super.set(key, data, opts);
    if (typeof opts === 'object' && opts !== null && opts.tags) {
      this.tagIndex.register(key, opts.tags);
    }
  }

  /**
   * Deletes a key from storage and removes its tag index mapping.
   *
   * @param key - Cache key to remove.
   * @returns True if entry existed and was deleted.
   */
  public override delete(key: string): boolean {
    this.tagIndex.unregister(key);
    return super.delete(key);
  }

  /**
   * Clears all cached items and resets the tag index.
   */
  public override clear(): void {
    this.tagIndex.clear();
    super.clear();
  }

  /**
   * Scans and removes all entries that have passed their expiration timestamp.
   *
   * @returns Number of pruned entries.
   */
  public pruneExpired(): number {
    return pruneExpiredEntries(this.storage);
  }

  /**
   * Invalidates all cache entries whose keys start with a specific prefix.
   *
   * @param prefix - Key prefix to match (e.g. `'users:'`).
   * @returns Number of invalidated entries.
   */
  public invalidatePrefix(prefix: string): number {
    return invalidateByPrefix(this.storage, prefix);
  }

  /**
   * Invalidates all cache entries whose keys match a regular expression pattern.
   *
   * @param regex - Regular expression to test keys against.
   * @returns Number of invalidated entries.
   */
  public invalidatePattern(regex: RegExp): number {
    return invalidateByPattern(this.storage, regex);
  }

  /**
   * Invalidates all cache entries associated with one or more tags.
   *
   * @param tags - Single tag string or array of tag strings.
   * @returns Number of invalidated entries.
   */
  public invalidateTags(tags: string | readonly string[]): number {
    const res = invalidateWithTagIndex(this.storage, this.tagIndex, tags, (k) =>
      this.emitInvalidation(k),
    );
    if (res > 0) return res;
    return invalidateByTags(this.storage, typeof tags === 'string' ? [tags] : tags);
  }

  /**
   * Invalidates a popover node and all its transitive descendants in a cascading DAG hierarchy.
   *
   * @param rootKey - Root popover key to invalidate from.
   * @param getChildren - Accessor returning children keys for any given popover key.
   * @returns Number of invalidated branch entries.
   */
  public invalidateBranch(
    rootKey: string,
    getChildren: (key: string) => Iterable<string> | readonly string[] | undefined,
  ): number {
    return invalidateDAGBranch(this.storage, rootKey, getChildren, (k) => {
      this.tagIndex.unregister(k);
      this.emitInvalidation(k);
    });
  }

  /**
   * Refreshes the expiration timestamp of an active cache entry (sliding expiration).
   *
   * @param key - Cache key to touch.
   * @param opts - New TTL or touch options.
   * @returns True if entry was found and updated.
   */
  public touch(key: string, opts?: number | TouchOptions): boolean {
    return touchCacheEntry(this.storage, key, opts ?? this.ttl);
  }
}

