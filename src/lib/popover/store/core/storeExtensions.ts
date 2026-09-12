/**
 * Zustand Store Extension and Lifecycle Attachment Engine.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/core/storeExtensions
 */

import type { StoreApi } from 'zustand/vanilla';
import type {
  PopoverStore,
  PopoverCache,
  StoreSliceDescriptor,
  InferSliceActionsFromTuple,
  InferSliceStateFromTuple,
} from '../../types';
import type { PopoverFSMRegistry, PopoverCardFSM } from '../fsm';
import type { PopoverDAG } from '../../utils/dag';
import { findEntryInStore } from '../../utils/storeHelpers';
import { DISPOSE_SYMBOL } from '../../utils/disposable';
import { buildStoreDependencies } from './storeDependencies';
import { runStoreDisposal } from './storeDisposal';
import type { StoreManagers } from './storeManagers';

type CombinedStore<
  TData,
  TContext,
  TPopoverKey extends string,
  TSlices extends readonly unknown[],
> = PopoverStore<TData, TContext, TPopoverKey, InferSliceActionsFromTuple<TSlices>> &
  InferSliceStateFromTuple<TSlices>;

export interface StoreLifecycleExtensions<
  TData,
  TContext,
  TPopoverKey extends string,
  TSlices extends readonly unknown[],
> {
  readonly dispose: () => void;
  readonly [DISPOSE_SYMBOL]: () => void;
  readonly getServerSnapshot: () => CombinedStore<TData, TContext, TPopoverKey, TSlices>;
  readonly fsmRegistry: PopoverFSMRegistry<TData, TPopoverKey>;
  readonly getFSM: (key: TPopoverKey) => PopoverCardFSM<TData, TPopoverKey> | undefined;
  readonly getDAG: () => PopoverDAG<TPopoverKey>;
}

export interface AttachStoreExtensionsParams<
  TData,
  TContext,
  TPopoverKey extends string,
  TSlices extends readonly unknown[],
> {
  store: StoreApi<CombinedStore<TData, TContext, TPopoverKey, TSlices>>;
  mgrs: StoreManagers<TData, TContext, TPopoverKey>;
  effectiveCache: PopoverCache<TData>;
  customSlices?: readonly StoreSliceDescriptor<object, object, TData, TContext, TPopoverKey>[];
}

export function attachStoreExtensions<
  TData,
  TContext,
  TPopoverKey extends string,
  TSlices extends readonly unknown[],
>(
  params: AttachStoreExtensionsParams<TData, TContext, TPopoverKey, TSlices>,
): StoreApi<CombinedStore<TData, TContext, TPopoverKey, TSlices>> &
  StoreLifecycleExtensions<TData, TContext, TPopoverKey, TSlices> {
  const { store, mgrs, effectiveCache, customSlices } = params;
  const disposalDeps = buildStoreDependencies<TData, TContext, TPopoverKey>({
    ...mgrs,
    effectiveCache,
    customSlices,
    resetStoreState: () => {},
    getStoreState: store.getState,
    findEntryByKey: (k) => findEntryInStore(store.getState().floating, store.getState().trail, k),
  });

  const dispose = () =>
    runStoreDisposal({ store, customSlices, dependencies: disposalDeps, ...mgrs });

  const extensions: StoreLifecycleExtensions<TData, TContext, TPopoverKey, TSlices> = {
    dispose,
    [DISPOSE_SYMBOL]: dispose,
    getServerSnapshot: store.getInitialState,
    fsmRegistry: mgrs.fsmRegistry,
    getFSM: (key: TPopoverKey) => mgrs.fsmRegistry.get(key),
    getDAG: () => mgrs.popoverDAG,
  };

  return Object.assign(store, extensions);
}
