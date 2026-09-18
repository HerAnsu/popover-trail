/**
 * Disposal & Resource Teardown for Popover Persistence Slice.
 *
 * @module store/slices/persistence/destroy
 */

import type { PopoverCache } from '../../../types';
import type { SliceContext } from '../context';

function clearStoreCaches<TData>(
  depsCache?: PopoverCache<TData> | null,
  storeCache?: PopoverCache<TData> | null,
): void {
  depsCache?.destroy?.();
  if (storeCache && storeCache !== depsCache) {
    if (typeof storeCache.destroy === 'function') {
      storeCache.destroy();
    } else if (typeof storeCache.clear === 'function') {
      storeCache.clear();
    }
  }
}

function abortActiveControllers(activeControllers: Map<string, AbortController>): void {
  if (activeControllers.size > 0) {
    for (const controller of activeControllers.values()) {
      controller.abort();
    }
    activeControllers.clear();
  }
}

/**
 * Tears down all store resources, controllers, caches, and listeners.
 *
 * @example
 * ```ts
 * destroyStoreResources(sliceContext);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Store slice context containing dependencies to dismantle.
 */
export function destroyStoreResources<TData, TContext, TPopoverKey extends string>(
  ctx: SliceContext<TData, TContext, TPopoverKey>,
): void {
  const { get, deps } = ctx;
  const {
    activeControllers,
    eventListeners,
    resetStoreState,
    clearHistory,
    cache,
    inFlightPromises,
    transitionScheduler,
    popoverDAG,
  } = deps;

  resetStoreState();
  clearHistory();
  eventListeners.clear();
  clearStoreCaches(cache, get().cache);
  abortActiveControllers(activeControllers);

  if (inFlightPromises?.size > 0) {
    inFlightPromises.clear();
  }

  transitionScheduler.clear();
  popoverDAG?.clear();
}
