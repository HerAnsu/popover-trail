/**
 * Open Root & Push Nested State Reducers for popover-trail store.
 *
 * @module store/reducers/openReducers
 */

import type { TrailEntry, PopoverStateData, StatePatch } from '../../types';
import {
  bringToFrontPatch,
  filterRecord,
  getActiveKeys,
  getNextZIndexOrder,
} from './stackReducers';

function normalizeOriginalEntry<TData, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey>,
  isRoot = false,
): TrailEntry<TData, TPopoverKey> {
  return {
    ...entry,
    parentKey: isRoot ? undefined : entry.parentKey,
    originalParentKey: entry.originalParentKey ?? entry.parentKey,
    originalRect: entry.originalRect ?? entry.rect,
  };
}

function buildActiveTrailPatch<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  nextTrail: TrailEntry<TData, TPopoverKey>[],
  activeKey: TPopoverKey,
  extraPatch?: StatePatch<TData, TContext, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  const activeKeys = getActiveKeys(state.floating, nextTrail);
  return {
    ...extraPatch,
    trail: nextTrail,
    offsets: filterRecord(state.offsets, activeKeys),
    pinnedStates: filterRecord(state.pinnedStates, activeKeys),
    nestedHydrationRequestCounters: filterRecord(
      state.nestedHydrationRequestCounters ?? {},
      activeKeys,
    ),
    zIndexOrder: getNextZIndexOrder(state.zIndexOrder, activeKeys, activeKey),
  };
}

/**
 * Pure state reducer computing next state when opening a root popover card.
 */
export function openRootState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  ownerId: string,
  entry: TrailEntry<TData, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  if (state.floating.some((e) => e.key === entry.key)) {
    return bringToFrontPatch(state, entry.key);
  }
  const nextEntry = normalizeOriginalEntry(entry, true);
  const filteredTrail = state.trail.filter((e) => e.key !== entry.key);
  const nextTrail = state.ownerId === ownerId ? [...filteredTrail, nextEntry] : [nextEntry];

  return buildActiveTrailPatch(state, nextTrail, entry.key, { ownerId });
}

function computeNextTrailForNestedPush<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  index: number,
  finalEntry: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey>[] | null {
  const isFloating = index < state.floating.length;
  if (isFloating) {
    const floatingEntry = state.floating[index];
    if (!floatingEntry || floatingEntry.key === finalEntry.key) return null;
    return [finalEntry];
  }

  const trailIndex = index - state.floating.length;
  const parentEntry = state.trail[trailIndex];
  if (!parentEntry || parentEntry.key === finalEntry.key) return null;

  const cleanEntry =
    finalEntry.parentKey === finalEntry.key ? { ...finalEntry, parentKey: undefined } : finalEntry;
  const baseTrail = state.trail.slice(0, trailIndex + 1).filter((e) => e.key !== cleanEntry.key);
  return [...baseTrail, cleanEntry];
}

/**
 * Pure state reducer computing next state when pushing a nested child card.
 */
export function pushNestedState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  index: number,
  entry: TrailEntry<TData, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  if (state.floating.some((e) => e.key === entry.key)) {
    return bringToFrontPatch(state, entry.key);
  }

  const isFloating = index < state.floating.length;
  const finalEntry = normalizeOriginalEntry(entry);
  const nextTrail = computeNextTrailForNestedPush(state, index, finalEntry);
  if (!nextTrail) return {};

  const extraPatch = isFloating
    ? { ownerId: state.floating[index]?.key ?? state.ownerId }
    : undefined;

  return buildActiveTrailPatch(state, nextTrail, entry.key, extraPatch);
}
