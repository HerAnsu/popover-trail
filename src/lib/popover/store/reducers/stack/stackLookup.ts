/**
 * Fast Zero-GC Lookup and Collection Utilities for Popover Lists.
 *
 * @module store/reducers/stack/stackLookup
 */

import type { TrailEntry } from '../../../types';

/**
 * Finds index of a specific popover key in entry list using fast loop.
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
 */
export function toFilteredOutEntryKey<TData = unknown, TPopoverKey extends string = string>(
  list: readonly TrailEntry<TData, TPopoverKey>[],
  key: TPopoverKey,
): TrailEntry<TData, TPopoverKey>[] {
  const result: TrailEntry<TData, TPopoverKey>[] = [];
  for (const entry of list) {
    if (entry && entry.key !== key) {
      result.push(entry);
    }
  }
  return result;
}

export const filterOutEntryKey = toFilteredOutEntryKey;

/**
 * Elevates target key to top of z-index ordering without duplicate allocation.
 */
export function elevateKeyInOrder<TPopoverKey extends string = string>(
  order: readonly TPopoverKey[],
  key: TPopoverKey,
): readonly TPopoverKey[] {
  const result: TPopoverKey[] = [];
  for (const item of order) {
    if (item !== key) result.push(item);
  }
  result.push(key);
  return result;
}
