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

/**
 * Configuration payload required to build the Zustand store state creator.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @template TSlices - Custom slices tuple type.
 */
export interface StoreStateInitializerConfig<
  TData,
  TContext,
  TPopoverKey extends string,
  TSlices extends readonly unknown[],
> {
  /** Headless store managers bundle. */
  readonly mgrs: StoreManagers<TData, TContext, TPopoverKey>;
  /** Resolved cache instance. */
  readonly effectiveCache: PopoverCache<TData>;
  /** Ambient context value or undefined. */
  readonly effectiveContext: TContext | undefined;
  /** Async data resolver function. */
  readonly resolveData: PopoverResolver<TData, TContext>;
  /** Optional custom store slices. */
  readonly customSlices?: readonly StoreSliceDescriptor<object, object, TData, TContext, TPopoverKey>[];
  /** Merged initial store state. */
  readonly mergedState: PopoverStateData<TData, TContext, TPopoverKey> & InferSliceStateFromTuple<TSlices>;
  /** Getter returning the lazily initialized store instance. */
  readonly getStoreInstance: () => StoreApi<
    CombinedStoreState<TData, TContext, TPopoverKey, TSlices>
  > | null;
}

/**
 * Builds the Zustand `StateCreator` function initializing state, safeSet, and action dispatchers.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @template TSlices - Custom slices tuple type.
 * @param cfg - Store state initializer configuration bundle.
 * @returns StateCreator function passed to createStore.
 *
 * @example
 * ```typescript
 * const initializer = buildStoreStateInitializer(config);
 * const store = createStore(initializer);
 * ```
 */
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
    const { mgrs, effectiveCache, customSlices, mergedState, getStoreInstance } = cfg;
    const { middlewareEngine } = mgrs;

    const safeSet = createSafeSet<CombinedStore, TData, TContext, TPopoverKey>(
      set,
      get,
      middlewareEngine,
    );
    const findEntryByKey = (k: string) => {
      const { floating, trail } = get();
      return findEntryInStore(floating, trail, k);
    };
    const resetStoreState = () => executeStoreReset({ ...mgrs, safeSet });
    const boundResolve = createBoundResolver(get, cfg, safeSet, findEntryByKey);

    const deps = buildStoreDependencies<TData, TContext, TPopoverKey>({
      ...mgrs,
      effectiveCache,
      customSlices,
      findEntryByKey,
      resolvePopoverEntry: boundResolve,
      resetStoreState,
      getStoreState: get,
      subscribeState: (l) => getStoreInstance()?.subscribe(l) ?? noop,
    });

    const actions = Object.freeze(
      createStoreActions<TData, TContext, TPopoverKey, InferSliceActionsFromTuple<TSlices>>(
        safeSet,
        get,
        deps,
      ),
    );
    return {
      ...mergedState,
      ...actions,
      get actions() {
        return actions;
      },
    } satisfies object as CombinedStore;
  };
}
