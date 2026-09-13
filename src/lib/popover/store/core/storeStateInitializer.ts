/**
 * State and Action Initializer Factory for Zustand Store.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/core/storeStateInitializer
 */

import type { StoreApi, StateCreator } from 'zustand/vanilla';
import type {
  PopoverStore,
  PopoverStateData,
  PopoverResolver,
  PopoverCache,
  StoreSliceDescriptor,
  InferSliceActionsFromTuple,
  InferSliceStateFromTuple,
} from '../../types';
import { findEntryInStore } from '../../utils/storeHelpers';
import { createStoreActions } from '../storeActionRegistry';
import { createBoundResolver } from './storeResolverBinding';
import { createSafeSet } from './storeSafeSet';
import { buildStoreDependencies } from './storeDependencies';
import { executeStoreReset } from './storeReset';
import type { StoreManagers } from './storeManagers';
import { noop } from '../../utils/functional';

export type CombinedStoreState<
  TData,
  TContext,
  TPopoverKey extends string,
  TSlices extends readonly unknown[],
> = PopoverStore<TData, TContext, TPopoverKey, InferSliceActionsFromTuple<TSlices>> &
  InferSliceStateFromTuple<TSlices>;

export interface StoreStateInitializerConfig<
  TData,
  TContext,
  TPopoverKey extends string,
  TSlices extends readonly unknown[],
> {
  mgrs: StoreManagers<TData, TContext, TPopoverKey>;
  effectiveCache: PopoverCache<TData>;
  effectiveContext: TContext | undefined;
  resolveData: PopoverResolver<TData, TContext>;
  customSlices?: readonly StoreSliceDescriptor<object, object, TData, TContext, TPopoverKey>[];
  mergedState: PopoverStateData<TData, TContext, TPopoverKey> & InferSliceStateFromTuple<TSlices>;
  getStoreInstance: () => StoreApi<
    CombinedStoreState<TData, TContext, TPopoverKey, TSlices>
  > | null;
}

export function buildStoreStateInitializer<
  TData,
  TContext,
  TPopoverKey extends string,
  TSlices extends readonly unknown[],
>(
  cfg: StoreStateInitializerConfig<TData, TContext, TPopoverKey, TSlices>,
): StateCreator<CombinedStoreState<TData, TContext, TPopoverKey, TSlices>> {
  type CombinedStore = CombinedStoreState<TData, TContext, TPopoverKey, TSlices>;

  return (set, get): CombinedStore => {
    const safeSet = createSafeSet<CombinedStore, TData, TContext, TPopoverKey>(
      set,
      get,
      cfg.mgrs.middlewareEngine,
    );
    const findEntryByKey = (k: string) => findEntryInStore(get().floating, get().trail, k);
    const resetStoreState = () => executeStoreReset({ ...cfg.mgrs, safeSet });
    const boundResolve = createBoundResolver(get, cfg, safeSet, findEntryByKey);

    const deps = buildStoreDependencies<TData, TContext, TPopoverKey>({
      ...cfg.mgrs,
      effectiveCache: cfg.effectiveCache,
      customSlices: cfg.customSlices,
      findEntryByKey,
      resolvePopoverEntry: boundResolve,
      resetStoreState,
      getStoreState: get,
      subscribeState: (l) => cfg.getStoreInstance()?.subscribe(l) ?? noop,
    });

    const actions = Object.freeze(
      createStoreActions<TData, TContext, TPopoverKey, InferSliceActionsFromTuple<TSlices>>(
        safeSet,
        get,
        deps,
      ),
    );
    return {
      ...cfg.mergedState,
      ...actions,
      get actions() {
        return actions;
      },
    } satisfies object as CombinedStore;
  };
}
