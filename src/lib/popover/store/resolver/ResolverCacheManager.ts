/**
 * High-cohesion synchronous L1 cache access and eviction manager.
 * Provides bounded cache management and deterministic invalidation routines.
 *
 * @module store/resolver/ResolverCacheManager
 */

import type { PopoverCache } from '../../types';
import { isPromise } from '../../utils/storeHelpers';
import { isObjectRecord } from '../../utils/guards/objectGuards';
import { getSyncCachedData } from './pipelineCache';

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

export interface ResolverCacheOptions {
  readonly maxSize?: number;
  readonly capacity?: number;
}

export class ResolverCacheManager<TData = unknown, TPopoverKey extends string = string> {
  private readonly cache?: PopoverCache<TData>;
  public readonly maxSize?: number;

  constructor(cache?: PopoverCache<TData>, { maxSize, capacity }: ResolverCacheOptions = {}) {
    this.cache = cache;
    this.maxSize = maxSize ?? capacity;
  }

  public readSync(key: TPopoverKey): TData | undefined {
    return getSyncCachedData(this.cache, key);
  }

  public writeSync(key: TPopoverKey, data: TData): void {
    if (!this.cache || isPromise(data)) return;
    try {
      this.cache.set(key, data);
    } catch {
      /* ignore */
    }
  }

  public invalidate(key?: TPopoverKey): void {
    if (!this.cache) return;
    try {
      if (key !== undefined) this.cache.delete(key);
      else this.cache.clear();
    } catch {
      /* ignore */
    }
  }

  public invalidatePrefix(prefix: string): void {
    invokeCacheMethod(this.cache, 'invalidatePrefix', prefix);
  }

  public invalidatePattern(regex: RegExp): void {
    invokeCacheMethod(this.cache, 'invalidatePattern', regex);
  }

  public invalidateTags(tags: string | readonly string[]): void {
    invokeCacheMethod(this.cache, 'invalidateTags', tags);
  }

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

  public clear(): void { this.invalidate(); }

  public [Symbol.dispose](): void { this.invalidate(); }
}
