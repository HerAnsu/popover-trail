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
 *
 * @example
 * ```ts
 * const unchanged = areEntriesShallowEqual(existingEntry, { rect: existingEntry.rect });
 * if (!unchanged) {
 *   // apply update
 * }
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Valid popover key union.
 * @param existing - Existing TrailEntry object.
 * @param patch - Partial TrailEntry properties to compare.
 * @returns True if all properties in patch are strictly identical in existing.
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
