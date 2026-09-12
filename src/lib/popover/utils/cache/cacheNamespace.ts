/**
 * Hierarchical scoped cache namespace partition for nested popover flows.
 *
 * @module cache/cacheNamespace
 */

import type { CacheSetOptions, SWRFetchOptions } from './cacheTypes';
import type { SimplePopoverCache } from './SimplePopoverCache';

export interface ScopedPopoverCache<TData = unknown> {
  readonly namespace: string;
  get(key: string): TData | undefined;
  set(key: string, data: TData, opts?: number | CacheSetOptions): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): number;
  mutate(key: string, updater: TData | ((prev: TData | undefined) => TData)): TData;
  subscribe(key: string, listener: (value: TData | undefined) => void): () => void;
  getOrSet(key: string, fetcher: () => Promise<TData>, opts?: SWRFetchOptions): Promise<TData>;
}

export function createScopedCache<TData>(
  parent: SimplePopoverCache<TData>,
  namespace: string,
): ScopedPopoverCache<TData> {
  const prefix = `${namespace}:`;

  return {
    namespace,
    get: (key) => parent.get(prefix + key),
    set: (key, data, opts) => parent.set(prefix + key, data, opts),
    has: (key) => parent.has(prefix + key),
    delete: (key) => parent.delete(prefix + key),
    clear: () => parent.invalidatePrefix(prefix),
    mutate: (key, updater) => parent.mutate(prefix + key, updater),
    subscribe: (key, listener) => parent.subscribe(prefix + key, listener),
    getOrSet: (key, fetcher, opts) => parent.getOrSet(prefix + key, fetcher, opts),
  };
}
