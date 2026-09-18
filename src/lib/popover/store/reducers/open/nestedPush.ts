/**
 * Nested Child Push Calculations for Floating and Cascading Popover Lists.
 *
 * @module store/reducers/open/nestedPush
 */

import type { PopoverStateData, TrailEntry } from '../../../types';
import { findEntryIndex, filterOutEntry } from '../stack';
import { take } from '../../../utils/arrayUtils';

function computeFloatingNestedPush<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  index: number,
  finalEntry: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey>[] | null {
  const floatingEntry = floating[index];
  if (!floatingEntry || floatingEntry.key === finalEntry.key) return null;
  return [finalEntry];
}

function computeTrailNestedPush<TData, TPopoverKey extends string = string>(
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  trailIndex: number,
  finalEntry: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey>[] | null {
  const parentEntry = trail[trailIndex];
  if (!parentEntry || parentEntry.key === finalEntry.key) return null;

  const slicedTrail = take(trail, trailIndex + 1);
  const baseTrail =
    findEntryIndex(slicedTrail, finalEntry.key) !== -1
      ? filterOutEntry(slicedTrail, finalEntry.key)
      : slicedTrail;

  return [...baseTrail, finalEntry];
}

/**
 * Computes the updated trail array for nested child push operations.
 * Handles both floating parent docking and cascading trail hierarchy truncation.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global application context.
 * @template TPopoverKey - Registered string key identifiers.
 * @param state - Current store state snapshot.
 * @param index - Index of parent card in unified stack.
 * @param finalEntry - Normalized child TrailEntry to append.
 * @returns Updated array of TrailEntries or `null` if invalid operation.
 *
 * @example
 * ```typescript
 * const nextTrail = computeNextTrailForNestedPush(state, 0, childEntry);
 * ```
 */
export function computeNextTrailForNestedPush<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  index: number,
  finalEntry: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey>[] | null {
  const { floating, trail } = state;
  return index < floating.length
    ? computeFloatingNestedPush(floating, index, finalEntry)
    : computeTrailNestedPush(trail, index - floating.length, finalEntry);
}
