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
  return (params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>) =>
    resolvePopoverEntry(get, params, {
      popoverDAG: cfg.mgrs.popoverDAG,
      cache: cfg.effectiveCache,
      resolveData: cfg.resolveData,
      initialContext: cfg.effectiveContext,
      inFlightPromises: cfg.mgrs.controllerManager.inFlightPromises,
      registerController: cfg.mgrs.controllerManager.registerController,
      removeController: cfg.mgrs.controllerManager.removeController,
      safeSet,
      findEntryByKey,
      eventBus: cfg.mgrs.eventBus,
      eventListeners: cfg.mgrs.eventListeners,
    });
}
