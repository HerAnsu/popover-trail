/**
 * Background Prefetching and Resolution Retry Pipeline.
 *
 * @module store/resolver/prefetchPipeline
 */

import type { StoreApi } from 'zustand/vanilla';
import type { StoreState, TrailEntry } from '../../types';
import { invokeResolver } from './resolverArity';

/**
 * Options for background prefetching.
 *
 * @template TData - Type of parent popover data.
 * @template TContext - Type of shared context.
 */
export interface PrefetchOptions<TData = unknown, TContext = unknown> {
  /** Optional context overrides passed to the resolver during prefetch. */
  readonly context?: TContext;
  /** Optional parent data if the prefetch represents a child popover node. */
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
 * Prefetches data for a popover key in the background without modifying the active trail or stack.
 *
 * Executes the resolver with an isolated `AbortController` signal and silently returns the fetched data
 * or `undefined` on error.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param store - Target Zustand store instance.
 * @param key - Popover key to prefetch.
 * @param options - Context and parentData parameters for resolution.
 * @returns Promise resolving to prefetched data or `undefined`.
 *
 * @example
 * ```typescript
 * const data = await prefetchData(store, 'preview-card', {
 *   parentData: rootItem,
 * });
 * ```
 */
export async function prefetchData<TData, TContext, TPopoverKey extends string = string>(
  store: StoreApi<StoreState<TData, TContext, TPopoverKey>>,
  key: TPopoverKey,
  options?: PrefetchOptions<TData, TContext>,
): Promise<TData | undefined> {
  const { resolveData, context } = store.getState();
  if (!resolveData) return undefined;

  const controller = new AbortController();
  const { parentData, activeContext } = getPrefetchContext<TData, TContext>(options, context);

  try {
    return await invokeResolver(
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
 * Retries failed data resolution for a popover entry in the store.
 *
 * Invokes the store's `retryPopover` action to restart the resolution lifecycle.
 *
 * @template TData - Resolved data type.
 * @template TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param store - Popover Zustand store instance.
 * @param key - Popover key to retry.
 * @param _entry - Optional reference to the current entry.
 *
 * @example
 * ```typescript
 * await retryResolution(store, 'failed-card');
 * ```
 */
export async function retryResolution<TData, TContext, TPopoverKey extends string = string>(
  store: StoreApi<StoreState<TData, TContext, TPopoverKey>>,
  key: TPopoverKey,
  _entry?: TrailEntry<TData, TPopoverKey>,
): Promise<void> {
  await store.getState().retryPopover(key);
}
