/**
 * Bound Popover Resolver Factory for Store Initialization.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module store/core/storeResolverBinding
 */

import type { PopoverStore, TrailEntry } from '../../types';
import { resolvePopoverEntry, type ResolvePopoverEntryParams } from '../storeResolverPipeline';
import type { SafeSetFn } from './storeSafeSet';
import type { StoreStateInitializerConfig } from './storeStateInitializer';

/**
 * Creates a bound popover resolver function pre-wired with cache, DAG, controllers, and safeSet.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @template TSlices - Custom slices tuple type.
 * @param get - State getter function.
 * @param cfg - Store state initializer configuration.
 * @param safeSet - Safe state mutation dispatcher.
 * @param findEntryByKey - Entry lookup function.
 * @returns Bound async resolver function.
 *
 * @example
 * ```typescript
 * const resolver = createBoundResolver(get, cfg, safeSet, findEntryByKey);
 * await resolver({ key: 'user' });
 * ```
 */
export function createBoundResolver<
  TData,
  TContext,
  TPopoverKey extends string,
  TSlices extends readonly unknown[],
>(
  get: () => PopoverStore<TData, TContext, TPopoverKey>,
  cfg: StoreStateInitializerConfig<TData, TContext, TPopoverKey, TSlices>,
  safeSet: SafeSetFn<TData, TContext, TPopoverKey>,
  findEntryByKey: (k: string) => TrailEntry<TData, TPopoverKey> | undefined,
) {
  const { mgrs, effectiveCache, resolveData, effectiveContext } = cfg;
  const { popoverDAG, controllerManager, eventBus, eventListeners } = mgrs;
  const { inFlightPromises, registerController, removeController } = controllerManager;

  return (params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>) =>
    resolvePopoverEntry(get, params, {
      popoverDAG,
      cache: effectiveCache,
      resolveData,
      initialContext: effectiveContext,
      inFlightPromises,
      registerController,
      removeController,
      safeSet,
      findEntryByKey,
      eventBus,
      eventListeners,
    });
}
