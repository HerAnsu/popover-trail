/**
 * Shallow Property Equality Evaluator for Popover Entries.
 *
 * @module store/reducers/stack/entryEquality
 */

import type { TrailEntry } from '../../../types';

function isEntryKey<TData, TPopoverKey extends string = string>(
  obj: Partial<TrailEntry<TData, TPopoverKey>>,
  key: string,
): key is keyof TrailEntry<TData, TPopoverKey> {
  return Object.hasOwn(obj, key);
}

/**
 * Checks shallow property equality between an existing entry and partial updates.
 */
export function areEntriesShallowEqual<TData, TPopoverKey extends string = string>(
  existing: TrailEntry<TData, TPopoverKey>,
  patch: Partial<TrailEntry<TData, TPopoverKey>>,
): boolean {
  for (const propertyName in patch) {
    if (isEntryKey(patch, propertyName) && patch[propertyName] !== existing[propertyName]) {
      return false;
    }
  }
  return true;
}
