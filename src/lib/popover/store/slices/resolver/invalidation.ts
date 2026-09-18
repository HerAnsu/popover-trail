/**
 * Cache Invalidation Actions for Popover Resolver.
 *
 * @module store/slices/resolver/invalidation
 */

import type { PopoverActions } from '../../../types';
import { findEntryInStore } from '../../../utils/storeHelpers';
import { logger } from '../../../utils/logger';
import { isArray } from '../../../utils/guards/arrayGuards';
import type { SliceContext } from '../context';

/**
 * Creates the cache invalidation action.
 *
 * @example
 * ```ts
 * const { invalidate } = createResolverInvalidationAction(ctx, retryPopover);
 * await invalidate('profileCard');
 * ```
 *
 * @template TData - Resolved popover data payload type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Slice context container with Zustand accessors.
 * @param retryPopover - Retry resolver function delegate.
 * @returns Object exposing `invalidate` method.
 */
export function createResolverInvalidationAction<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: SliceContext<TData, TContext, TPopoverKey>,
  retryPopover: (key: TPopoverKey, options?: { forceRefresh?: boolean }) => Promise<void>,
): Pick<PopoverActions<TData, TContext, TPopoverKey>, 'invalidate'> {
  const { get, deps } = ctx;
  const { cache, activeControllers, inFlightPromises, startBatch, endBatch } = deps;

  return {
    invalidate: async (keyOrKeys) => {
      const keys = isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
      if (keys.length === 0) return;

      const fetchPromises: Promise<void>[] = [];
      const { cache: storeCache, floating, trail, debug } = get();
      const activeCache = storeCache ?? cache;

      startBatch();
      try {
        for (const key of keys) {
          if (!key) continue;

          activeCache?.delete(key);
          if (cache && activeCache !== cache) {
            cache.delete(key);
          }

          const activeEntry = findEntryInStore(floating, trail, key);
          if (activeEntry) {
            const inFlightCtrl = activeControllers.get(key);
            if (inFlightCtrl && activeEntry.isLoading) {
              inFlightCtrl.abort();
              activeControllers.delete(key);
              inFlightPromises.delete(key);
            }

            fetchPromises.push(retryPopover(key, { forceRefresh: true }));
          }
        }
      } finally {
        endBatch();
      }

      const results = await Promise.allSettled(fetchPromises);
      for (const res of results) {
        if (res.status === 'rejected' && debug) {
          logger.error('[popover-trail]: Invalidation refetch error:', res.reason);
        }
      }
    },
  };
}
