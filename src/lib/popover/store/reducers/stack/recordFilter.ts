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
 *
 * @example
 * ```ts
 * const allowed = new Set(['a', 'b']);
 * const sanitized = filterByAllowedKeys({ a: 1, b: 2, c: 3 }, allowed);
 * // => { a: 1, b: 2 }
 * ```
 *
 * @template V - Value type within the record dictionary.
 * @template K - Allowed string key type.
 * @param record - Source record to filter.
 * @param allowedKeys - Set of valid keys to retain.
 * @returns Cleaned record containing only allowed keys, or original if unchanged.
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
 *
 * @example
 * ```ts
 * const activeKeys = getActiveKeys(floating, trail);
 * console.log(activeKeys.has('card-1'));
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Valid popover key union.
 * @param floating - Readonly collection of floating pinned entries.
 * @param trail - Readonly collection of active trail entries.
 * @returns Set containing unique keys from all active entries.
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
