/**
 * Cycle-safe topological branch teardown for hierarchical popover cascades.
 *
 * @module cache/cacheDAGInvalidation
 */

import type { StorageAdapter } from './cacheTypes';
import { isValidStorageKey } from '../safeKeys';

/**
 * Recursively invalidates a branch in a directed acyclic graph (DAG) hierarchy in post-order.
 *
 * Traversal visits all reachable descendants first, accumulating keys in bottom-up order,
 * ensuring children are purged before parents. Cycle protection is guaranteed via a visited set.
 *
 * @template T - The stored data type.
 * @param storage - The storage adapter backing the cache.
 * @param rootKey - The root entry key whose subtree should be invalidated.
 * @param getChildren - Function providing child keys for a given node.
 * @param onDelete - Optional callback invoked after each key deletion.
 * @returns The number of entries successfully deleted from storage.
 *
 * @example
 * ```ts
 * const deleted = invalidateDAGBranch(
 *   storage,
 *   'menu-root',
 *   (key) => childMap.get(key),
 *   (deletedKey) => console.log('Deleted:', deletedKey)
 * );
 * ```
 */
export function invalidateDAGBranch<T = unknown>(
  storage: StorageAdapter<T>,
  rootKey: string,
  getChildren: (key: string) => Iterable<string> | readonly string[] | undefined,
  onDelete?: (key: string) => void,
): number {
  if (!isValidStorageKey(rootKey)) return 0;

  const visited = new Set<string>();
  const deletionOrder: string[] = [];

  function collect(currentKey: string): void {
    if (visited.has(currentKey) || !isValidStorageKey(currentKey)) return;
    visited.add(currentKey);

    const children = getChildren(currentKey);
    if (children) {
      for (const childKey of children) {
        if (!visited.has(childKey)) {
          collect(childKey);
        }
      }
    }
    deletionOrder.push(currentKey);
  }

  collect(rootKey);

  let deletedCount = 0;
  for (const key of deletionOrder) {
    if (storage.delete(key)) {
      deletedCount++;
      onDelete?.(key);
    }
  }

  return deletedCount;
}
