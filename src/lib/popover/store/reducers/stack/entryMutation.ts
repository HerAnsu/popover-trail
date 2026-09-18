/**
 * Entry Replacement and Structural Sharing List Mutators for popover-trail.
 *
 * @module store/reducers/stack/entryMutation
 */

import type { TrailEntry } from '../../../types';

/**
 * Returns a new array with the element at index replaced by nextEntry.
 *
 * @example
 * ```ts
 * const updatedList = replaceEntryInList(list, 1, modifiedEntry);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Valid popover key union.
 * @param list - Source TrailEntry array.
 * @param index - Numerical index to replace.
 * @param nextEntry - New TrailEntry instance to place at index.
 * @returns New array with replaced entry.
 */
export function replaceEntryInList<TData, TPopoverKey extends string = string>(
  list: readonly TrailEntry<TData, TPopoverKey>[],
  index: number,
  nextEntry: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey>[] {
  const nextList = [...list];
  nextList[index] = nextEntry;
  return nextList;
}
