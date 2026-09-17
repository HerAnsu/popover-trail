/**
 * Prefetch & Background Data Caching Actions for Popover Resolver.
 *
 * @module store/slices/resolver/prefetch
 */

import type { PopoverActions } from '../../../types';
import { isAbortError } from '../../../utils/typeGuards';
import { isPromise } from '../../../utils/storeHelpers';
import type { SliceContext } from '../context';
import { createResolverInvalidationAction } from './invalidation';
import { invokeResolver } from './helpers';

const awaitSafeAbort = async <T>(promise: Promise<T>): Promise<T | undefined> => {
  try {
    return await promise;
  } catch (err: unknown) {
    if (isAbortError(err)) return undefined;
    throw err;
  }
};

export type ResolverPrefetchAndInvalidateActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Pick<PopoverActions<TData, TContext, TPopoverKey>, 'prefetchPopover' | 'invalidate'>;

/**
 * Creates the resolver prefetch and invalidation actions.
 */
export function createResolverPrefetchActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: SliceContext<TData, TContext, TPopoverKey>,
  retryPopover: (key: TPopoverKey, options?: { forceRefresh?: boolean }) => Promise<void>,
): ResolverPrefetchAndInvalidateActions<TData, TContext, TPopoverKey> {
  const { get, deps } = ctx;
  const { activeControllers, inFlightPromises, findEntryByKey, cache } = deps;
  const invalidation = createResolverInvalidationAction(ctx, retryPopover);

  const prefetchPopover: ResolverPrefetchAndInvalidateActions<
    TData,
    TContext,
    TPopoverKey
  >['prefetchPopover'] = async (key, parentData) => {
    const activeCache = get().cache ?? cache;
    const cached = activeCache?.get(key);
    if (cached !== undefined) return isPromise(cached) ? await cached : cached;

    const inFlight = inFlightPromises.get(key);
    if (inFlight) return awaitSafeAbort(inFlight);

    const ownsController = !activeControllers.has(key);
    const controller = activeControllers.get(key) ?? new AbortController();
    if (ownsController) activeControllers.set(key, controller);

    const fetchPromise = (async (): Promise<TData> => {
      try {
        const { cache: storeCache, resolveData, context } = get();
        const activeLocalCache = storeCache ?? cache;
        const parentKey = findEntryByKey(key)?.parentKey;
        const effectiveParentData =
          parentData ?? (parentKey ? findEntryByKey(parentKey)?.data : undefined) ?? undefined;
        const res = await invokeResolver<TData, TContext>(
          resolveData,
          key,
          effectiveParentData,
          context ?? undefined,
          controller.signal,
        );
        activeLocalCache?.set(key, res);
        return res;
      } finally {
        if (ownsController && activeControllers.get(key) === controller) {
          activeControllers.delete(key);
        }
        inFlightPromises.delete(key);
      }
    })();

    inFlightPromises.set(key, fetchPromise);
    return awaitSafeAbort(fetchPromise);
  };
  return { prefetchPopover, ...invalidation };
}
