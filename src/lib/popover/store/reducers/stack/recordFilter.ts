/**
 * High-performance Record and Collection Filtering Utilities for popover-trail.
 *
 * @module store/reducers/stack/recordFilter
 */

import type { TrailEntry } from '../../../types';
import { isUnsafeKey } from '../../../utils/safeKeys';
import { pickKeys } from '../../../utils/cleanObject';
import { emptyRecord } from '../../storeDefaults';

function shouldPreserveRecord<V, K extends string>(
  record: Readonly<Partial<Record<K, V>>>,
  allowedKeys: ReadonlySet<string>,
): boolean {
  let recordKeyCount = 0;
  for (const key in record) {
    if (Object.hasOwn(record, key)) {
      recordKeyCount++;
      if (!allowedKeys.has(key) || isUnsafeKey(key)) {
        return false;
      }
    }
  }
  return recordKeyCount > 0 && recordKeyCount <= allowedKeys.size;
}

/**
 * Pure Record filtering keeping only allowed keys without allocating intermediate objects when possible.
 */
export function filterByAllowedKeys<V, K extends string = string>(
  record: Readonly<Partial<Record<K, V>>> | undefined,
  allowedKeys: ReadonlySet<K>,
): Readonly<Partial<Record<K, V>>> {
  if (!record || allowedKeys.size === 0) return emptyRecord<K, V>();
  if (shouldPreserveRecord(record, allowedKeys)) {
    return record;
  }
  return pickKeys(record, allowedKeys);
}

/**
 * Extracts set of active popover keys from floating and trail lists without extra arrays.
 */
export function getActiveKeys<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
): Set<TPopoverKey> {
  const result = new Set<TPopoverKey>();
  for (const entry of floating) {
    if (entry) result.add(entry.key);
  }
  for (const entry of trail) {
    if (entry) result.add(entry.key);
  }
  return result;
}
