/**
 * Hierarchical scoped cache namespace partition for nested popover flows.
 *
 * @module cache/cacheNamespace
 */

import type { CacheSetOptions, SWRFetchOptions } from './cacheTypes';
import type { SimplePopoverCache } from './SimplePopoverCache';

/**
 * An isolated view of a cache where all keys are automatically prefixed with a namespace string.
 */
export interface ScopedPopoverCache<TData = unknown> {
  /** The namespace prefix applied to all operations. */
  readonly namespace: string;
  /** Retrieves a value by key within the namespace. */
  get(key: string): TData | undefined;
  /** Sets a value by key within the namespace. */
  set(key: string, data: TData, opts?: number | CacheSetOptions): void;
  /** Checks if a key exists and is valid within the namespace. */
  has(key: string): boolean;
  /** Deletes a key from the namespace. */
  delete(key: string): boolean;
  /** Invalidates all entries residing within this namespace. */
  clear(): number;
  /** Atomically updates a key within the namespace. */
  mutate(key: string, updater: TData | ((prev: TData | undefined) => TData)): TData;
  /** Subscribes to changes on a key within the namespace. */
  subscribe(key: string, listener: (value: TData | undefined) => void): () => void;
  /** Retrieves or asynchronously computes a key within the namespace using SWR semantics. */
  getOrSet(key: string, fetcher: () => Promise<TData>, opts?: SWRFetchOptions): Promise<TData>;
}

/**
 * Creates an isolated sub-cache partitioned by a namespace prefix (e.g., `modal:profile:`).
 *
 * All operations on the returned scoped cache automatically prepend `${namespace}:` to keys,
 * and calling `clear()` will only invalidate entries bearing this prefix.
 *
 * @template TData - Stored data type.
 * @param parent - The root or parent `SimplePopoverCache` instance.
 * @param namespace - Namespace identifier string.
 * @returns A scoped cache instance constrained to the given namespace.
 *
 * @example
 * ```ts
 * const userCache = createScopedCache(rootCache, 'users');
 * userCache.set('42', { name: 'Alice' }); // Stores as 'users:42' in rootCache
 *
 * userCache.get('42'); // returns { name: 'Alice' }
 * userCache.clear(); // invalidates all 'users:*' keys
 * ```
 */
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
