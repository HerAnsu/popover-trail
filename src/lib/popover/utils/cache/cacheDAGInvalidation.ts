/**
 * Cycle-safe topological branch teardown for hierarchical popover cascades.
 *
 * @module cache/cacheDAGInvalidation
 */

import type { StorageAdapter } from './cacheTypes';
import { isValidStorageKey } from '../safeKeys';

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
