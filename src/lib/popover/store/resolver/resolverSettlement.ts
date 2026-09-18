/**
 * State Settlement Calculations for Resolved Popover Entries.
 *
 * @module store/resolver/resolverSettlement
 */

import type { StoreState, StatePatch, TrailEntry } from '../../types';
import { patchEntryInLists, createResolvedTrailEntry } from '../reducers';
import { isPopoverActive } from '../../utils/predicates';
import type { ResolvePopoverEntryParams, StatePatchUpdater } from './resolverTypes';

function hasEntryInLists<TData = unknown, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): boolean {
  return isPopoverActive({ floating, trail }, key);
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
 * Commits a settled popover entry (resolved data or error) into active floating/trail lists or root state patch.
 *
 * Checks whether the key already exists in active popover lists. If active, updates the existing entry in place
 * while preserving layout and pin states. Otherwise, generates a state patch via `params.insertStatePatch`.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param state - Current store state snapshot.
 * @param key - Popover key identifier.
 * @param targetEntry - Settled TrailEntry instance with resolved data or error.
 * @param params - Optional resolution parameters containing insertion patch factory.
 * @returns StatePatch updating the store.
 *
 * @example
 * ```typescript
 * const patch = commitResolverSettlement(state, 'card-1', resolvedEntry, params);
 * ```
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
