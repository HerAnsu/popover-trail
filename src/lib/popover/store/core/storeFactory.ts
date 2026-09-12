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

