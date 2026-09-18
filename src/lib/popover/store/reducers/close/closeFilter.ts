/**
 * Entry List Retained Filter for Teardown & Close Operations.
 *
 * @module store/reducers/close/closeFilter
 */

import type { TrailEntry } from '../../../types';
import { hasKeyIn } from '../../../utils/predicates';
import { not } from '../../../utils/functional';
import { omitKeys } from '../../../utils/cleanObject';
import { emptyRecord } from '../../storeDefaults';

/**
 * Filters out removed keys from an entry list, preserving the existing array reference when no entries are affected.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param list - Array of trail entries to filter.
 * @param removedKeys - Set of keys being removed.
 * @returns Filtered array, or original array reference if untouched.
 *
 * @example
 * ```typescript
 * const retained = filterRetainedEntries(trail, new Set(['card-2']));
 * ```
 */
export function filterRetainedEntries<TData, TPopoverKey extends string = string>(
  list: readonly TrailEntry<TData, TPopoverKey>[],
  removedKeys: ReadonlySet<TPopoverKey>,
): readonly TrailEntry<TData, TPopoverKey>[] {
  const isRemoved = hasKeyIn<TrailEntry<TData, TPopoverKey>>(removedKeys);
  if (!list.some(isRemoved)) return list;
  return list.filter(not(isRemoved));
}

/**
 * Omits removed keys from state dictionary records (offsets, pinnedStates, counters) during teardown.
 *
 * @template V - Value type in record.
 * @template K - Key type in record.
 * @param record - Source record to prune.
 * @param removedKeys - Set of keys to omit.
 * @returns Pruned record without the removed keys.
 *
 * @example
 * ```typescript
 * const nextOffsets = omitRemovedRecordKeys(state.offsets, removedKeys);
 * ```
 */
export function omitRemovedRecordKeys<V, K extends string = string>(
  record: Readonly<Partial<Record<K, V>>> | undefined,
  removedKeys: ReadonlySet<K>,
): Readonly<Partial<Record<K, V>>> {
  if (!record || removedKeys.size === 0) return record ?? emptyRecord<K, V>();
  return omitKeys(record, removedKeys);
}
