/**
 * Stack Management and Entry Mutation Reducers for popover-trail store.
 *
 * @module store/reducers/stack/stackReducers
 */

import type { StatePatch, TrailEntry } from '../../../types';
import { EMPTY_OBJECT } from '../../storeDefaults';
import { findEntryIndex } from './stackLookup';
import { areEntriesShallowEqual } from './entryEquality';
import { replaceEntryInList } from './entryMutation';

export { areEntriesShallowEqual } from './entryEquality';
export { getSnapshotStatePatch } from './stackSnapshot';

/**
 * Updates a single entry in floating or trail lists using an updated entry object.
 */
export function updateEntryInLists<TData, TContext = unknown, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: TPopoverKey,
  updatedEntry: TrailEntry<TData, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  const floatingIdx = findEntryIndex(floating, key);
  if (floatingIdx !== -1) {
    const current = floating[floatingIdx];
    if (!current || current === updatedEntry || areEntriesShallowEqual(current, updatedEntry)) {
      return EMPTY_OBJECT;
    }
    return {
      floating: replaceEntryInList(floating, floatingIdx, updatedEntry),
      trail,
    };
  }

  const trailIdx = findEntryIndex(trail, key);
  if (trailIdx !== -1) {
    const current = trail[trailIdx];
    if (!current || current === updatedEntry || areEntriesShallowEqual(current, updatedEntry)) {
      return EMPTY_OBJECT;
    }
    return {
      floating,
      trail: replaceEntryInList(trail, trailIdx, updatedEntry),
    };
  }

  return EMPTY_OBJECT;
}

/**
 * Builds a minimal structural-sharing patch transforming the entry identified by key through updater.
 */
export function patchEntryInLists<TData, TContext = unknown, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: TPopoverKey,
  update: (entry: TrailEntry<TData, TPopoverKey>) => TrailEntry<TData, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  const floatingIdx = findEntryIndex(floating, key);
  if (floatingIdx !== -1) {
    const current = floating[floatingIdx];
    return current
      ? { floating: replaceEntryInList(floating, floatingIdx, update(current)) }
      : EMPTY_OBJECT;
  }

  const trailIdx = findEntryIndex(trail, key);
  if (trailIdx !== -1) {
    const current = trail[trailIdx];
    return current ? { trail: replaceEntryInList(trail, trailIdx, update(current)) } : EMPTY_OBJECT;
  }

  return EMPTY_OBJECT;
}
