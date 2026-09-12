/**
 * Nested Child Push Calculations for Floating and Cascading Popover Lists.
 *
 * @module store/reducers/open/nestedPush
 */

import type { PopoverStateData, TrailEntry } from '../../../types';
import { findEntryIndex, filterOutEntryKey } from '../stack';

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

  const slicedTrail = trail.slice(0, trailIndex + 1);
  const baseTrail =
    findEntryIndex(slicedTrail, finalEntry.key) !== -1
      ? filterOutEntryKey(slicedTrail, finalEntry.key)
      : slicedTrail;

  return [...baseTrail, finalEntry];
}

/**
 * Computes the updated trail array for nested child push operations.
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
  return index < state.floating.length
    ? computeFloatingNestedPush(state.floating, index, finalEntry)
    : computeTrailNestedPush(state.trail, index - state.floating.length, finalEntry);
}
