/**
 * Open Root & Push Nested State Reducers for popover-trail store.
 *
 * @module store/reducers/open/openReducers
 */

import type { TrailEntry, PopoverStateData, StatePatch } from '../../../types';
import { EMPTY_OBJECT } from '../../storeDefaults';
import { findUnifiedEntryIndex, filterOutEntry } from '../stack';
import { createTrailEntryNode } from '../entry';
import { buildActiveTrailPatch, computeNextTrailForNestedPush } from './openHelpers';
import { findFloatingElevationPatch } from './openElevation';

/**
 * Computes the state patch for opening a root popover card.
 *
 * @remarks
 * If the card is already pinned in floating mode, elevates it to the front instead of creating a duplicate.
 * If opened by the same owner, appends to or replaces in the active trail.
 * If opened by a new owner, begins a new active trail branch anchored by this entry.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global application context.
 * @template TPopoverKey - Registered string key identifiers.
 * @param state - Current store state snapshot.
 * @param ownerId - Identifier of the trail owner / root trigger.
 * @param entry - TrailEntry describing the popover to open.
 * @returns State patch containing updated trail, active status, and z-index order.
 *
 * @example
 * ```typescript
 * const patch = openRootState(store.getState(), 'menu-btn', rootEntry);
 * store.setState(patch);
 * ```
 */
export function openRootState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  ownerId: string,
  entry: TrailEntry<TData, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  const { floating, trail, ownerId: currentOwnerId } = state;
  // If this key is already pinned in the floating stack, bring it to the front
  const elevatePatch = findFloatingElevationPatch(floating, state, entry.key);
  if (elevatePatch) return elevatePatch;

  const nextEntry = createTrailEntryNode(entry, { isRoot: true });
  const nextTrail =
    currentOwnerId === ownerId
      ? [...filterOutEntry(trail, entry.key), nextEntry]
      : [nextEntry];

  return buildActiveTrailPatch(state, nextTrail, entry.key, { ownerId });
}

/**
 * Computes the state patch for pushing a nested child popover card at a cascade depth index.
 *
 * @remarks
 * If the card is already pinned in floating mode, elevates it to the front.
 * Truncates any deeper sibling entries beyond `index` and appends the new child entry.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global application context.
 * @template TPopoverKey - Registered string key identifiers.
 * @param state - Current store state snapshot.
 * @param index - Unified cascade depth index of the parent card.
 * @param entry - TrailEntry describing the child popover to push.
 * @returns State patch with updated trail branch, or empty object if invalid index.
 *
 * @example
 * ```typescript
 * const patch = pushNestedState(store.getState(), 0, childEntry);
 * store.setState(patch);
 * ```
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
 * Computes the state patch for pushing a nested child popover under a specific parent key.
 *
 * @remarks
 * Looks up the parent key across both floating and trail cards. If found, pushes the child
 * under that parent; otherwise falls back to opening as a root card.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global application context.
 * @template TPopoverKey - Registered string key identifiers.
 * @param state - Current store state snapshot.
 * @param parentKey - Identifier of the parent popover.
 * @param entry - TrailEntry describing the child popover.
 * @returns State patch for the opened popover.
 *
 * @example
 * ```typescript
 * const patch = pushNestedByKeyState(store.getState(), 'parent-card', childEntry);
 * store.setState(patch);
 * ```
 */
export function pushNestedByKeyState<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  parentKey: TPopoverKey,
  entry: TrailEntry<TData, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  const { floating, trail, ownerId } = state;
  const unifiedIndex = findUnifiedEntryIndex(floating, trail, parentKey);
  if (unifiedIndex !== -1) {
    return pushNestedState(state, unifiedIndex, entry);
  }
  return openRootState(state, ownerId ?? 'root', entry);
}
