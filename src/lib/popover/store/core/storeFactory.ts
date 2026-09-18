/**
 * Zustand Store Composition Root Engine for popover-trail.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module storeFactory
 */

import { createStore, type StoreApi } from 'zustand/vanilla';
import type {
  PopoverStore,
  PopoverResolver,
  PopoverCache,
  InferSliceActionsFromTuple,
  InferSliceStateFromTuple,
} from '../../types';
import { type PopoverStoreOptions } from './storeOptions';
import { normalizeStoreConfig, buildMergedInitialState } from './storeInitState';
import { initStoreManagers } from './storeManagers';
import { buildStoreStateInitializer } from './storeStateInitializer';
import { attachStoreExtensions, type StoreLifecycleExtensions } from './storeExtensions';

export type PopoverStoreInstance<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TSlices extends readonly unknown[] = readonly unknown[],
> = StoreApi<
  PopoverStore<TData, TContext, TPopoverKey, InferSliceActionsFromTuple<TSlices>> &
    InferSliceStateFromTuple<TSlices>
> &
  StoreLifecycleExtensions<TData, TContext, TPopoverKey, TSlices>;

/**
 * Creates a fully configured headless popover-trail store instance.
 *
 * @remarks
 * Assembles the full headless architecture including DAG hierarchy tracking,
 * microtask batching, LRU/custom caching, async cancellation pipelines,
 * undo/redo history, FSM card registries, and custom slice extensions.
 *
 * @example
 * ```ts
 * const store = createPopoverStore(
 *   async (key) => {
 *     const res = await fetch(`/api/cards/${key}`);
 *     return res.json();
 *   },
 *   { initialContext: { userId: '123' } },
 * );
 *
 * store.getState().actions.openRoot('userProfile');
 * ```
 *
 * @template TData - Data payload resolved for each popover card.
 * @template TContext - Global shared ambient context.
 * @template TPopoverKey - Union of valid popover string keys.
 * @template TSlices - Tuple of custom store slice extensions.
 * @param resolveData - Async data resolution function for fetching popover contents.
 * @param initialContextOrOptions - Initial context object or configuration options.
 * @param cache - Optional cache instance override for data deduplication.
 * @returns Fully typed and extended PopoverStore instance.
 */
export function createPopoverStore<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  const TSlices extends readonly unknown[] = readonly unknown[],
>(
  resolveData: PopoverResolver<TData, TContext> = () => Promise.resolve(null as TData),
  initialContextOrOptions?: TContext | PopoverStoreOptions<TData, TContext, TPopoverKey, TSlices>,
  cache?: PopoverCache<TData>,
): PopoverStoreInstance<TData, TContext, TPopoverKey, TSlices> {
  type CombinedStore = PopoverStore<
    TData,
    TContext,
    TPopoverKey,
    InferSliceActionsFromTuple<TSlices>
  > &
    InferSliceStateFromTuple<TSlices>;

  const { effectiveContext, effectiveCache, customSlices } = normalizeStoreConfig<
    TData,
    TContext,
    TPopoverKey,
    TSlices
  >(initialContextOrOptions, cache);
  const mgrs = initStoreManagers<TData, TContext, TPopoverKey>(customSlices);
  const mergedState = buildMergedInitialState<TData, TContext, TPopoverKey, TSlices>(
    resolveData,
    effectiveContext,
    effectiveCache,
    customSlices,
  );
  let storeInstance: StoreApi<CombinedStore> | null = null;

  const initializer = buildStoreStateInitializer<TData, TContext, TPopoverKey, TSlices>({
    mgrs,
    effectiveCache,
    effectiveContext,
    resolveData,
    customSlices,
    mergedState,
    getStoreInstance: () => storeInstance,
  });

  const store = createStore<CombinedStore>(initializer);
  storeInstance = store;
  mgrs.batchingManager.attachSubscriber(store);

  return attachStoreExtensions({
    store,
    mgrs,
    effectiveCache,
    customSlices,
  });
}
