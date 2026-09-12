/**
 * State Settlement Calculations for Resolved Popover Entries.
 *
 * @module store/resolver/resolverSettlement
 */

import type { StoreState, StatePatch, TrailEntry } from '../../types';
import { patchEntryInLists, createResolvedTrailEntry } from '../reducers';
import type { ResolvePopoverEntryParams, StatePatchUpdater } from './resolverTypes';

function hasEntryInLists<TData = unknown, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): boolean {
  return floating.some((e) => e.key === key) || trail.some((e) => e.key === key);
}

function resolveSettledEntry<TData, TPopoverKey extends string>(
  existing: TrailEntry<TData, TPopoverKey>,
  target: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey> {
  const { data, error, isLoading } = target;
  return createResolvedTrailEntry(existing, data, error, isLoading);
}

function resolveStatePatch<TData, TContext, TPopoverKey extends string>(
  patch: StatePatchUpdater<TData, TContext, TPopoverKey>,
  state: StoreState<TData, TContext, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  return typeof patch === 'function' ? patch(state) : patch;
}

/**
 * Commits a resolved or error entry into active floating/trail lists or root state patch.
 */
export function commitResolverSettlement<TData, TContext, TPopoverKey extends string>(
  state: StoreState<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  targetEntry: TrailEntry<TData, TPopoverKey>,
  params?: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
): StatePatch<TData, TContext, TPopoverKey> {
  const { floating, trail } = state;
  if (hasEntryInLists(floating, trail, key)) {
    return patchEntryInLists(floating, trail, key, (existing) =>
      resolveSettledEntry(existing, targetEntry),
    );
  }

  if (!params) return {};
  return resolveStatePatch(params.insertStatePatch(targetEntry), state);
}
