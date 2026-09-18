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
import { noop } from '../../utils/functional';

type CombinedStore<
  TData,
  TContext,
  TPopoverKey extends string,
  TSlices extends readonly unknown[],
> = PopoverStore<TData, TContext, TPopoverKey, InferSliceActionsFromTuple<TSlices>> &
  InferSliceStateFromTuple<TSlices>;

/**
 * Lifecycle and inspection methods attached to the vanilla Zustand store instance.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @template TSlices - Custom slices tuple type.
 */
export interface StoreLifecycleExtensions<
  TData,
  TContext,
  TPopoverKey extends string,
  TSlices extends readonly unknown[],
> {
  /** Explicit resource disposal method cleaning up all timers, controllers, and listeners. */
  readonly dispose: () => void;
  /** ECMAScript explicit resource management disposal symbol. */
  readonly [DISPOSE_SYMBOL]: () => void;
  /** SSR snapshot getter returning initial store state. */
  readonly getServerSnapshot: () => CombinedStore<TData, TContext, TPopoverKey, TSlices>;
  /** Finite state machine registry for per-popover lifecycles. */
  readonly fsmRegistry: PopoverFSMRegistry<TData, TPopoverKey>;
  /** Retrieves the FSM controller for a specific popover key if registered. */
  readonly getFSM: (key: TPopoverKey) => PopoverCardFSM<TData, TPopoverKey> | undefined;
  /** Returns the directed acyclic graph tracking hierarchy relations. */
  readonly getDAG: () => PopoverDAG<TPopoverKey>;
}

/**
 * Parameters passed to attachStoreExtensions.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @template TSlices - Custom slices tuple type.
 */
export interface AttachStoreExtensionsParams<
  TData,
  TContext,
  TPopoverKey extends string,
  TSlices extends readonly unknown[],
> {
  /** Zustand store instance. */
  readonly store: StoreApi<CombinedStore<TData, TContext, TPopoverKey, TSlices>>;
  /** Store managers bundle. */
  readonly mgrs: StoreManagers<TData, TContext, TPopoverKey>;
  /** Resolved cache instance. */
  readonly effectiveCache: PopoverCache<TData>;
  /** Optional custom store slices. */
  readonly customSlices?: readonly StoreSliceDescriptor<object, object, TData, TContext, TPopoverKey>[];
}

/**
 * Augments the vanilla Zustand store instance with lifecycle disposal, FSM registry, and DAG accessors.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @template TSlices - Custom slices tuple type.
 * @param params - Configuration object with store, managers, and cache.
 * @returns Augmented store instance with StoreLifecycleExtensions.
 *
 * @example
 * ```typescript
 * const extendedStore = attachStoreExtensions({ store, mgrs, effectiveCache });
 * extendedStore.dispose();
 * ```
 */
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
  const { fsmRegistry, popoverDAG } = mgrs;

  const disposalDeps = buildStoreDependencies<TData, TContext, TPopoverKey>({
    ...mgrs,
    effectiveCache,
    customSlices,
    resetStoreState: noop,
    getStoreState: store.getState,
    findEntryByKey: (k) => {
      const { floating, trail } = store.getState();
      return findEntryInStore(floating, trail, k);
    },
  });

  const dispose = () =>
    runStoreDisposal({ store, customSlices, dependencies: disposalDeps, ...mgrs });

  const extensions: StoreLifecycleExtensions<TData, TContext, TPopoverKey, TSlices> = {
    dispose,
    [DISPOSE_SYMBOL]: dispose,
    getServerSnapshot: store.getInitialState,
    fsmRegistry,
    getFSM: (key: TPopoverKey) => fsmRegistry.get(key),
    getDAG: () => popoverDAG,
  };

  return Object.assign(store, extensions);
}
