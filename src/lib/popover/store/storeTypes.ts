/**
 * Strict Store Accessor Types for popover-trail.
 * Defines strongly-typed Zustand set/get functions eliminating the need for `as never` type casts.
 *
 * @module storeTypes
 */

import type { PopoverStateData, PopoverStore } from '../types';

/**
 * Strongly-typed Zustand state setter function accepting state patches or state updater functions.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - Context object payload type.
 */
export type StoreSetFn<TData = unknown, TContext = unknown> = (
  partial:
    | Partial<PopoverStateData<TData, TContext>>
    | ((state: PopoverStore<TData, TContext>) => Partial<PopoverStateData<TData, TContext>>),
) => void;

/**
 * Strongly-typed Zustand state getter function returning the complete store state.
 *
 * @template TData - The resolved data payload type.
 * @template TContext - Context object payload type.
 */
export type StoreGetFn<TData = unknown, TContext = unknown> = () => PopoverStore<TData, TContext>;
