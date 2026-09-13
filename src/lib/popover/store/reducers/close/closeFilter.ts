/**
 * Entry List Retained Filter for Teardown & Close Operations.
 *
 * @module store/reducers/close/closeFilter
 */

import type { TrailEntry } from '../../../types';
import { hasKeyIn } from '../../../utils/predicates';
import { not } from '../../../utils/functional';

/**
 * Filters out removed keys preserving array reference when no entries are affected.
 */
export function filterRetainedEntries<TData, TPopoverKey extends string = string>(
  list: readonly TrailEntry<TData, TPopoverKey>[],
  removedKeys: ReadonlySet<TPopoverKey>,
): readonly TrailEntry<TData, TPopoverKey>[] {
  const isRemoved = hasKeyIn<TrailEntry<TData, TPopoverKey>>(removedKeys);
  if (!list.some(isRemoved)) return list;
  return list.filter(not(isRemoved));
}
