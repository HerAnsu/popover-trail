/**
 * Background Prefetching and Resolution Retry Pipeline.
 *
 * @module store/resolver/prefetchPipeline
 */

import type { StoreApi } from 'zustand/vanilla';
import type { StoreState, TrailEntry } from '../../types';
import { invokeResolverSafely } from './resolverArity';

export interface PrefetchOptions<TData = unknown, TContext = unknown> {
  readonly context?: TContext;
  readonly parentData?: TData | null;
}

function getPrefetchContext<TData, TContext>(
  options: PrefetchOptions<TData, TContext> | undefined,
  storeContext: TContext | null | undefined,
) {
  return {
    parentData: options?.parentData,
    activeContext: options?.context ?? storeContext ?? undefined,
  };
}

/**
 * Prefetches data for a popover key in the background without modifying active trail stack.
 */
export async function prefetchPopoverData<TData, TContext, TPopoverKey extends string = string>(
  store: StoreApi<StoreState<TData, TContext, TPopoverKey>>,
  key: TPopoverKey,
  options?: PrefetchOptions<TData, TContext>,
): Promise<TData | undefined> {
  const { resolveData, context } = store.getState();
  if (!resolveData) return undefined;

  const controller = new AbortController();
  const { parentData, activeContext } = getPrefetchContext<TData, TContext>(options, context);

  try {
    return await invokeResolverSafely(
      resolveData,
      key,
      parentData,
      activeContext,
      controller.signal,
    );
  } catch {
    return undefined;
  } finally {
    controller.abort();
  }
}

/**
 * Retries failed resolution for a popover entry in the store.
 */
export async function retryPopoverResolution<TData, TContext, TPopoverKey extends string = string>(
  store: StoreApi<StoreState<TData, TContext, TPopoverKey>>,
  key: TPopoverKey,
  _entry?: TrailEntry<TData, TPopoverKey>,
): Promise<void> {
  await store.getState().retryPopover(key);
}
