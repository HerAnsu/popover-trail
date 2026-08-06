/**
 * Slice Context Object for popover-trail.
 * Defines the unified Dependency Injection container passed to domain action slice factories.
 *
 * @module sliceContext
 */

import type { StoreSetFn, StoreGetFn } from '../storeTypes';
import type { ActionRegistryDependencies } from '../storeActionRegistry';

/**
 * Unified Context container encapsulating Zustand set/get primitives and store dependencies.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export interface SliceContext<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  set: StoreSetFn<TData, TContext, TPopoverKey>;
  get: StoreGetFn<TData, TContext, TPopoverKey>;
  deps: ActionRegistryDependencies<TData, TContext, TPopoverKey>;
}
