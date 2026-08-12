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

export function normalizeOriginalEntry<TData>(entry: TrailEntry<TData>): TrailEntry<TData> {
  return {
    ...entry,
    originalParentKey: entry.originalParentKey ?? entry.parentKey,
    originalRect: entry.originalRect ?? entry.rect,
  };
}

/**
 * Pure state updater for initializing or opening a new root popover stack.
 */
export function openRootState<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  ownerId: string,
  entry: TrailEntry<TData>,
): Partial<PopoverStateData<TData, TContext>> {
  const hasFloating = state.floating.some((e) => e.key === entry.key);
  if (hasFloating) {
    return bringToFrontPatch(state, entry.key);
  }
  const nextEntry = normalizeOriginalEntry(entry);
  const isSameOwner = state.ownerId === ownerId;
  const filteredTrail = state.trail.filter((e) => e.key !== entry.key);
  const nextTrail = isSameOwner ? [...filteredTrail, nextEntry] : [nextEntry];

  const activeKeys = getActiveKeys(state.floating, nextTrail);

  return {
    ownerId,
    trail: nextTrail,
    offsets: filterRecord(state.offsets, activeKeys),
    zIndexOrder: getNextZIndexOrder(state.zIndexOrder, activeKeys, entry.key),
  };
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
 * Pure state updater for pushing or appending a nested popover into the active path.
 */
export function pushNestedState<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  index: number,
  entry: TrailEntry<TData>,
): Partial<PopoverStateData<TData, TContext>> {
  const hasFloating = state.floating.some((e) => e.key === entry.key);
  if (hasFloating) {
    return bringToFrontPatch(state, entry.key);
  }

  const finalEntry = normalizeOriginalEntry(entry);

  const nextTrail = computeNextTrailForNestedPush(state, index, finalEntry);
  if (!nextTrail) return {};

  const activeKeys = getActiveKeys(state.floating, nextTrail);

  return {
    trail: nextTrail,
    offsets: filterRecord(state.offsets, activeKeys),
    zIndexOrder: getNextZIndexOrder(state.zIndexOrder, activeKeys, entry.key),
  };
}
