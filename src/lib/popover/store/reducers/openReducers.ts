/**
 * Open Root & Push Nested State Reducers for popover-trail store.
 *
 * @module store/reducers/openReducers
 */

import type { TrailEntry, PopoverStateData } from '../../types';
import {
  bringToFrontPatch,
  filterRecord,
  getActiveKeys,
  getNextZIndexOrder,
} from './stackReducers';

function normalizeOriginalEntry<TData>(entry: TrailEntry<TData>): TrailEntry<TData> {
  return {
    ...entry,
    originalParentKey: entry.originalParentKey ?? entry.parentKey,
    originalRect: entry.originalRect ?? entry.rect,
  };
}

function buildActiveTrailPatch<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  nextTrail: TrailEntry<TData>[],
  activeKey: string,
  extraPatch?: Partial<PopoverStateData<TData, TContext>>,
): Partial<PopoverStateData<TData, TContext>> {
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
 *
 * @remarks
 * If the card is already pinned in `floating`, elevates its z-index instead of duplicating it.
 * If owned by the same trigger, appends to trail; otherwise resets trail with the new root.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @param state - Current reactive store state.
 * @param ownerId - Identifier of the triggering element.
 * @param entry - New root trail entry to mount.
 * @returns Partial state patch to apply.
 */
export function openRootState<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  ownerId: string,
  entry: TrailEntry<TData>,
): Partial<PopoverStateData<TData, TContext>> {
  if (state.floating.some((e) => e.key === entry.key)) {
    return bringToFrontPatch(state, entry.key);
  }
  const nextEntry = normalizeOriginalEntry(entry);
  const filteredTrail = state.trail.filter((e) => e.key !== entry.key);
  const nextTrail = state.ownerId === ownerId ? [...filteredTrail, nextEntry] : [nextEntry];

  return buildActiveTrailPatch(state, nextTrail, entry.key, { ownerId });
}

function computeNextTrailForNestedPush<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  index: number,
  finalEntry: TrailEntry<TData>,
): TrailEntry<TData>[] | null {
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
 *
 * @remarks
 * Truncates existing trail descendants past the parent index and appends the child entry.
 * If the card is already pinned in `floating`, brings it to the front without modifying the trail.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @param state - Current reactive store state.
 * @param index - Index of parent card (in combined floating + trail list).
 * @param entry - Child trail entry to attach.
 * @returns Partial state patch to apply.
 */
export function pushNestedState<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  index: number,
  entry: TrailEntry<TData>,
): Partial<PopoverStateData<TData, TContext>> {
  if (state.floating.some((e) => e.key === entry.key)) {
    return bringToFrontPatch(state, entry.key);
  }

  const finalEntry = normalizeOriginalEntry(entry);
  const nextTrail = computeNextTrailForNestedPush(state, index, finalEntry);
  if (!nextTrail) return {};

  return buildActiveTrailPatch(state, nextTrail, entry.key);
}
