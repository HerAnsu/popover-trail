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
 * @template TSliceState - Isolated local state dictionary defined by custom slice.
 */
export interface SliceContext<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TSliceState extends object = object,
> {
  readonly set: StoreSetFn<TData, TContext, TPopoverKey, TSliceState>;
  readonly get: StoreGetFn<TData, TContext, TPopoverKey, TSliceState>;
  readonly deps: ActionRegistryDependencies<TData, TContext, TPopoverKey>;
}
