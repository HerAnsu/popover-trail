/**
 * Data Resolver Domain Action Slice for popover-trail.
 * Encapsulates async/sync data resolution actions (openRootWithResolver, openNestedWithResolver, retryPopover, prefetchPopover, invalidate).
 *
 * @module store/slices/resolver/createResolverSlice
 */

import type { ResolverSliceActions } from '../../../types';
import { bringToFrontPatch } from '../../reducers/stack';
import type { SliceContext } from '../context';
import { createResolverRetryAction } from './retry';
import { createResolverPrefetchActions } from './prefetch';
import { createResolverOpenActions } from './openActions';

/**
 * Creates the Data Resolver domain action slice.
 * Combines root and nested resolver actions, retry mechanisms, and prefetching.
 *
 * @example
 * ```ts
 * const resolverSlice = createResolverSlice(ctx);
 * await resolverSlice.openRootWithResolver('profile');
 * ```
 *
 * @template TData - Resolved popover data payload type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Slice context container with Zustand accessors.
 * @returns Combined async resolver methods (`openRootWithResolver`, `openNestedWithResolver`, `prefetchPopover`, `invalidate`, `retryPopover`).
 */
export function createResolverSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: SliceContext<TData, TContext, TPopoverKey>,
): ResolverSliceActions<TData, TContext, TPopoverKey> {
  const { set, deps } = ctx;
  const { popoverDAG } = deps;

  const bringToFront = (key: TPopoverKey) => {
    set((state) => bringToFrontPatch(state, key, popoverDAG));
  };

  const retryPopoverAction = createResolverRetryAction(ctx);
  const prefetchActions = createResolverPrefetchActions(ctx, retryPopoverAction);
  const openActions = createResolverOpenActions(ctx, bringToFront);

  return {
    ...prefetchActions,
    ...openActions,
    retryPopover: retryPopoverAction,
  };
}
