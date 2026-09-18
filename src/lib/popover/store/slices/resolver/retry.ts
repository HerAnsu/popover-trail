/**
 * Retry Pipeline Action & Parameter Builder for Popover Resolver.
 *
 * @module store/slices/resolver/retry
 */

import type { PopoverActions, PopoverStateData, StatePatch, TrailEntry } from '../../../types';
import { extractDisplayOptions } from '../../../utils/displayOptions';
import { patchEntryInLists } from '../../reducers/stack';
import type { ResolvePopoverEntryParams } from '../../storeResolverPipeline';
import type { SliceContext } from '../context';

const createEntryUpdatePatch =
  <TData, TContext, TPopoverKey extends string>(
    key: TPopoverKey,
    updatedEntry: TrailEntry<TData, TPopoverKey>,
  ) =>
  ({
    floating,
    trail,
  }: PopoverStateData<TData, TContext, TPopoverKey>): StatePatch<TData, TContext, TPopoverKey> =>
    patchEntryInLists(floating, trail, key, () => updatedEntry);

function buildRetryPipelineParams<TData, TContext, TPopoverKey extends string = string>(
  key: TPopoverKey,
  entry: TrailEntry<TData, TPopoverKey>,
  effectiveParentKey: TPopoverKey | undefined,
  parentData: TData | null | undefined,
  forceRefresh: boolean,
  deps: SliceContext<TData, TContext, TPopoverKey>['deps'],
): ResolvePopoverEntryParams<TData, TContext, TPopoverKey> {
  const baseOptions = extractDisplayOptions(entry);
  const options = forceRefresh ? { ...baseOptions, forceRefresh: true } : baseOptions;
  const parentKey = effectiveParentKey;
  const isNested = parentKey !== undefined;
  const { incrementNestedCounter, incrementRootCounter, isNestedStale, isRootStale } = deps;

  return {
    key,
    parentKey,
    rect: entry.rect ?? null,
    parentData,
    options,
    controllerKey: parentKey ?? key,
    incrementCounter: isNested ? () => incrementNestedCounter(parentKey) : incrementRootCounter,
    isStale: isNested ? (started: number) => isNestedStale(parentKey, started) : isRootStale,
    insertStatePatch: (updated) => createEntryUpdatePatch(key, updated),
  };
}

/**
 * Creates the retry popover resolution action.
 *
 * @example
 * ```ts
 * const retryPopover = createResolverRetryAction(ctx);
 * await retryPopover('errorCard', { forceRefresh: true });
 * ```
 *
 * @template TData - Resolved popover data payload type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Slice context container with Zustand accessors.
 * @returns Retrying resolver action function.
 */
export function createResolverRetryAction<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: SliceContext<TData, TContext, TPopoverKey>,
): PopoverActions<TData, TContext, TPopoverKey>['retryPopover'] {
  const { deps } = ctx;
  const { resolvePopoverEntry, findEntryByKey } = deps;

  return async (key, retryOptions) => {
    const entry = findEntryByKey(key);
    const forceRefresh = Boolean(retryOptions?.forceRefresh);
    if (!entry || (entry.isLoading && !forceRefresh)) return;

    const { parentKey, originalParentKey } = entry;
    const effectiveParentKey = parentKey ?? originalParentKey;
    const parentData = effectiveParentKey ? findEntryByKey(effectiveParentKey)?.data : undefined;

    await resolvePopoverEntry(
      buildRetryPipelineParams(key, entry, effectiveParentKey, parentData, forceRefresh, deps),
    );
  };
}
