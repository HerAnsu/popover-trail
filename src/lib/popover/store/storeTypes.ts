/**
 * Strict Store Accessor Types for popover-trail.
 * Defines strongly-typed Zustand set/get functions eliminating the need for `as never` type casts.
 *
 * @module storeTypes
 */

import type { PopoverStore } from '../types';

/**
 * Strongly-typed Zustand state setter function accepting state patches or state updater functions.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - Context object payload type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export type StoreSetFn<TData = unknown, TContext = unknown, TPopoverKey extends string = string> = (
  partial:
    | Partial<PopoverStore<TData, TContext, TPopoverKey>>
    | ((
        state: PopoverStore<TData, TContext, TPopoverKey>,
      ) => Partial<PopoverStore<TData, TContext, TPopoverKey>>),
) => void;

/**
 * Strongly-typed Zustand state getter function returning the complete store state.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - Context object payload type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export type StoreGetFn<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = () => PopoverStore<TData, TContext, TPopoverKey>;

/**
 * Erased internal store state payload type.
 * Ensures V8 JIT monomorphism by operating on uniform `unknown` payload slots internally.
 */
export type InternalPopoverState = import('../types').PopoverStateData<unknown, unknown>;

/**
 * Erased internal store instance type used across store engine internals.
 */
export type InternalPopoverStore = PopoverStore;
