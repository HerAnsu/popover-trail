/**
 * Open Root & Push Nested State Reducers for popover-trail store.
 *
 * @module store/reducers/open/openReducers
 */

import type { TrailEntry, PopoverStateData, StatePatch } from '../../../types';
import { EMPTY_OBJECT } from '../../storeDefaults';
import { findUnifiedEntryIndex, filterOutEntryKey } from '../stack';
import { createTrailEntryNode } from '../entry';
import { buildActiveTrailPatch, computeNextTrailForNestedPush } from './openHelpers';
import { findFloatingElevationPatch } from './openElevation';

/**
 * Pure state reducer computing next state when opening a root popover card.
 */
export function openRootState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  ownerId: string,
  entry: TrailEntry<TData, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  const elevatePatch = findFloatingElevationPatch(state.floating, state, entry.key);
  if (elevatePatch) return elevatePatch;

  const nextEntry = createTrailEntryNode(entry, { isRoot: true });
  const nextTrail =
    state.ownerId === ownerId
      ? [...filterOutEntryKey(state.trail, entry.key), nextEntry]
      : [nextEntry];

  return buildActiveTrailPatch(state, nextTrail, entry.key, { ownerId });
}

/**
 * Pure state reducer computing next state when pushing a nested child card.
 */
export function pushNestedState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  index: number,
  entry: TrailEntry<TData, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  const elevatePatch = findFloatingElevationPatch(state.floating, state, entry.key);
  if (elevatePatch) return elevatePatch;

  const isFloating = index < state.floating.length;
  const finalEntry = createTrailEntryNode(entry);
  const nextTrail = computeNextTrailForNestedPush(state, index, finalEntry);
  if (!nextTrail) return EMPTY_OBJECT;

  const extraPatch = isFloating
    ? { ownerId: state.floating[index]?.key ?? state.ownerId }
    : undefined;

  return buildActiveTrailPatch(state, nextTrail, entry.key, extraPatch);
}

/**
 * Key-addressed pure reducer for pushing nested popovers.
 */
export function pushNestedByKeyState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  parentKey: TPopoverKey,
  entry: TrailEntry<TData, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  const unifiedIndex = findUnifiedEntryIndex(state.floating, state.trail, parentKey);
  if (unifiedIndex !== -1) {
    return pushNestedState(state, unifiedIndex, entry);
  }
  return openRootState(state, state.ownerId ?? 'root', entry);
}
