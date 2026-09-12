/**
 * Action Registry Dispatcher for popover-trail store.
 * Aggregates core slice actions into a single frozen dictionary.
 *
 * @module storeActionRegistry
 */

import type { StatePatch, PopoverStore, PopoverActions } from '../../types';
import {
  createTrailSlice,
  createPinningSlice,
  createSubscriptionsSlice,
  createResolverSlice,
  createPersistenceSlice,
  createConfigSlice,
  createTransactionsSlice,
  type SliceContext,
} from '../slices';
import type { ActionRegistryDependencies } from './storeActionRegistryTypes';

export * from './storeActionRegistryTypes';
export { createStoreActions } from './storeActions';

export function createActionRegistry<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  set: (
    partial:
      | StatePatch<TData, TContext, TPopoverKey>
      | ((
          state: PopoverStore<TData, TContext, TPopoverKey>,
        ) => StatePatch<TData, TContext, TPopoverKey>),
  ) => void,
  get: () => PopoverStore<TData, TContext, TPopoverKey>,
  dependencies: ActionRegistryDependencies<TData, TContext, TPopoverKey>,
): PopoverActions<TData, TContext, TPopoverKey> {
  const ctx: SliceContext<TData, TContext, TPopoverKey> = { set, get, deps: dependencies };
  return {
    ...createTrailSlice<TData, TContext, TPopoverKey>(ctx),
    ...createPinningSlice<TData, TContext, TPopoverKey>(ctx),
    ...createSubscriptionsSlice<TData, TContext, TPopoverKey>(ctx),
    ...createResolverSlice<TData, TContext, TPopoverKey>(ctx),
    ...createPersistenceSlice<TData, TContext, TPopoverKey>(ctx),
    ...createConfigSlice<TData, TContext, TPopoverKey>(ctx),
    ...createTransactionsSlice<TData, TContext, TPopoverKey>(ctx),
  };
}

export const createCoreActions = createActionRegistry;
