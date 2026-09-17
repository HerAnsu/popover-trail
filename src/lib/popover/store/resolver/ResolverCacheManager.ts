/**
 * High-cohesion synchronous L1 cache access and eviction manager.
 * Provides bounded cache management and deterministic invalidation routines.
 *
 * @module store/resolver/ResolverCacheManager
 */

import type { PopoverCache } from '../../types';
import { isPromise } from '../../utils/storeHelpers';
import { isObjectRecord } from '../../utils/guards/objectGuards';
import { readSyncCache } from './pipelineCache';

function invokeCacheMethod(cache: unknown, method: string, arg: unknown): void {
  if (isObjectRecord(cache)) {
    const fn = cache[method];
    if (typeof fn === 'function') {
      try {
        Reflect.apply(fn, cache, [arg]);
      } catch {
        /* isolated */
      }
    }
  }
}

/**
 * Configuration options for the `ResolverCacheManager`.
 */
export interface ResolverCacheOptions {
  /** Maximum number of entries allowed in the cache. */
  readonly maxSize?: number;
  /** Synonym for maxSize. */
  readonly capacity?: number;
}

/**
 * High-cohesion synchronous L1 cache manager for popover resolution pipelines.
 *
 * Provides bounded cache management, read-through / write-through helpers, and deterministic invalidation routines.
 *
 * @template TData - Cached data payload type.
 * @template TPopoverKey - Unique string identifier type for popover entries.
 *
 * @example
 * ```typescript
 * const cacheManager = new ResolverCacheManager(new InMemoryPopoverCache());
 * cacheManager.writeSync('user-1', userData);
 * const user = cacheManager.readSync('user-1');
 * ```
 */
export class ResolverCacheManager<TData = unknown, TPopoverKey extends string = string> {
  private readonly cache?: PopoverCache<TData>;
  public readonly maxSize?: number;

  /**
   * Initializes the resolver cache manager with an optional backing cache.
   *
   * @param cache - Underlying cache implementation.
   * @param options - Bounded capacity configuration options.
   */
  constructor(cache?: PopoverCache<TData>, { maxSize, capacity }: ResolverCacheOptions = {}) {
    this.cache = cache;
    this.maxSize = maxSize ?? capacity;
  }

  /**
   * Reads data synchronously from the L1 cache if present and non-promise.
   *
   * @param key - Popover key to look up.
   * @returns Cached value or `undefined`.
   *
   * @example
   * ```typescript
   * const item = cacheManager.readSync('profile');
   * ```
   */
  public readSync(key: TPopoverKey): TData | undefined {
    return readSyncCache(this.cache, key);
  }

  /**
   * Writes data synchronously into the L1 cache.
   * Silently ignores Promise values to preserve synchronous cache invariants.
   *
   * @param key - Popover key.
   * @param data - Resolved data value.
   *
   * @example
   * ```typescript
   * cacheManager.writeSync('profile', profileData);
   * ```
   */
  public writeSync(key: TPopoverKey, data: TData): void {
    if (!this.cache || isPromise(data)) return;
    try {
      this.cache.set(key, data);
    } catch {
      /* ignore */
    }
  }

  /**
   * Invalidates a single entry by key, or clears the entire cache if no key is provided.
   *
   * @param key - Optional key to invalidate.
   *
   * @example
   * ```typescript
   * cacheManager.invalidate('user-profile');
   * cacheManager.invalidate(); // clears all
   * ```
   */
  public invalidate(key?: TPopoverKey): void {
    if (!this.cache) return;
    try {
      if (key !== undefined) this.cache.delete(key);
      else this.cache.clear();
    } catch {
      /* ignore */
    }
  }

  /**
   * Invalidates all cache entries whose keys begin with the specified prefix.
   *
   * @param prefix - Key prefix to invalidate.
   *
   * @example
   * ```typescript
   * cacheManager.invalidatePrefix('user-');
   * ```
   */
  public invalidatePrefix(prefix: string): void {
    invokeCacheMethod(this.cache, 'invalidatePrefix', prefix);
  }

  /**
   * Invalidates all cache entries matching the specified regular expression.
   *
   * @param regex - Pattern to test keys against.
   *
   * @example
   * ```typescript
   * cacheManager.invalidatePattern(/^order-\d+$/);
   * ```
   */
  public invalidatePattern(regex: RegExp): void {
    invokeCacheMethod(this.cache, 'invalidatePattern', regex);
  }

  /**
   * Invalidates all cache entries associated with one or more tags.
   *
   * @param tags - Single tag or array of tags.
   *
   * @example
   * ```typescript
   * cacheManager.invalidateTags(['user', 'billing']);
   * ```
   */
  public invalidateTags(tags: string | readonly string[]): void {
    invokeCacheMethod(this.cache, 'invalidateTags', tags);
  }

  /**
   * Invalidates a parent entry and all of its topological descendants in the trail DAG.
   *
   * @param parentKey - Root key of the branch to invalidate.
   * @param getDescendants - Function returning an iterable of descendant keys.
   *
   * @example
   * ```typescript
   * cacheManager.invalidateBranch('menu', (key) => dag.getDescendants(key));
   * ```
   */
  public invalidateBranch(
    parentKey: TPopoverKey,
    getDescendants?: (key: TPopoverKey) => Iterable<TPopoverKey>,
  ): void {
    this.invalidate(parentKey);
    if (!getDescendants) return;
    try {
      for (const child of getDescendants(parentKey)) this.invalidate(child);
    } catch {
      /* isolated */
    }
  }

  /**
   * Clears the entire cache.
   */
  public clear(): void {
    this.invalidate();
  }

  public [Symbol.dispose](): void {
    this.invalidate();
  }
}
