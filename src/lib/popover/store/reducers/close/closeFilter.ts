/**
 * Entry List Retained Filter for Teardown & Close Operations.
 *
 * @module store/reducers/close/closeFilter
 */

import type { TrailEntry } from '../../../types';

/**
 * Filters out removed keys preserving array reference when no entries are affected.
 */
export function filterRetainedEntries<TData, TPopoverKey extends string = string>(
  list: readonly TrailEntry<TData, TPopoverKey>[],
  removedKeys: ReadonlySet<TPopoverKey>,
): readonly TrailEntry<TData, TPopoverKey>[] {
  let hasRemoved = false;
  for (const entry of list) {
    if (entry && removedKeys.has(entry.key)) {
      hasRemoved = true;
      break;
    }
  }
  if (!hasRemoved) return list;

  const result: TrailEntry<TData, TPopoverKey>[] = [];
  for (const entry of list) {
    if (entry && !removedKeys.has(entry.key)) {
      result.push(entry);
    }
  }
  return result;
}
