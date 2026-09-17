/**
 * Fast Zero-GC Lookup and Collection Utilities for Popover Lists.
 *
 * @module store/reducers/stack/stackLookup
 */

import type { TrailEntry } from '../../../types';
import { last } from '../../../utils/arrayUtils';

/**
 * Finds index of a specific popover key in entry list using fast loop.
 *
 * @example
 * ```ts
 * const idx = findEntryIndex(trail, 'profileCard');
 * ```
 *
 * @param list - Array of TrailEntry objects.
 * @param key - Popover key to search for.
 * @returns Index if found, or -1.
 */
export function findEntryIndex<TData = unknown, TPopoverKey extends string = string>(
  list: readonly TrailEntry<TData, TPopoverKey>[],
  key: TPopoverKey,
): number {
  for (let i = 0; i < list.length; i++) {
    if (list[i]?.key === key) return i;
  }
  return -1;
}

/**
 * Finds unified continuous index of a key across floating and trail collections.
 * Returns -1 if key is not present in either collection.
 *
 * @example
 * ```ts
 * const uIdx = findUnifiedEntryIndex(floating, trail, 'nestedCard');
 * ```
 *
 * @param floating - Readonly array of floating pinned entries.
 * @param trail - Readonly array of cascading trail entries.
 * @param key - Popover key to locate.
 * @returns Unified continuous index or -1 if not found.
 */
export function findUnifiedEntryIndex<TData = unknown, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: TPopoverKey,
): number {
  const floatingIndex = findEntryIndex(floating, key);
  if (floatingIndex !== -1) return floatingIndex;

  const trailIndex = findEntryIndex(trail, key);
  if (trailIndex !== -1) return floating.length + trailIndex;

  return -1;
}

/**
 * Filters out an entry matching target key without closure allocations.
 *
 * @example
 * ```ts
 * const remaining = filterOutEntry(trail, 'closedKey');
 * ```
 *
 * @param list - Source TrailEntry array.
 * @param key - Key of the entry to omit.
 * @returns New array without target entry, or original list if key was not found.
 */
export function filterOutEntry<TData = unknown, TPopoverKey extends string = string>(
  list: readonly TrailEntry<TData, TPopoverKey>[],
  key: TPopoverKey,
): TrailEntry<TData, TPopoverKey>[] {
  const index = findEntryIndex(list, key);
  if (index === -1) return list as TrailEntry<TData, TPopoverKey>[];

  const result: TrailEntry<TData, TPopoverKey>[] = [];
  for (const entry of list) {
    if (entry && entry.key !== key) {
      result.push(entry);
    }
  }
  return result;
}

/**
 * Elevates target key to top of z-index ordering without duplicate allocation.
 *
 * @example
 * ```ts
 * const order = elevateKeyInOrder(['a', 'b', 'c'], 'a');
 * // => ['b', 'c', 'a']
 * ```
 *
 * @param order - Readonly array of popover keys in stacking order.
 * @param key - Popover key to elevate to top.
 * @returns New array with key positioned last, or original array if already last.
 */
export function elevateKeyInOrder<TPopoverKey extends string = string>(
  order: readonly TPopoverKey[],
  key: TPopoverKey,
): readonly TPopoverKey[] {
  if (last(order) === key) {
    return order;
  }
  const result: TPopoverKey[] = [];
  for (const item of order) {
    if (item !== key) result.push(item);
  }
  result.push(key);
  return result;
}


