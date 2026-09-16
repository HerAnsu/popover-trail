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

/**
 * Omits removed keys from state records during teardown and close operations.
 */
export function omitRemovedRecordKeys<V, K extends string = string>(
  record: Readonly<Partial<Record<K, V>>> | undefined,
  removedKeys: ReadonlySet<K>,
): Readonly<Partial<Record<K, V>>> {
  if (!record || removedKeys.size === 0) return record ?? emptyRecord<K, V>();
  return omitKeys(record, removedKeys);
}
