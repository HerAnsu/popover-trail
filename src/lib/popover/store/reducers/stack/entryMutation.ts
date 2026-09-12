/**
 * Entry Replacement and Structural Sharing List Mutators for popover-trail.
 *
 * @module store/reducers/stack/entryMutation
 */

import type { TrailEntry } from '../../../types';

/**
 * Returns a new array with the element at index replaced by nextEntry.
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
