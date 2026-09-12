/**
 * Slice Descriptor Contracts and Tuple Action Inference for popover-trail.
 *
 * @module types/sliceDescriptorTypes
 */

import type { PopoverMiddleware } from './middlewareTypes';

export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type ReadonlyDeep<T> = T extends (...args: unknown[]) => unknown
  ? T
  : T extends object
    ? { readonly [P in keyof T]: ReadonlyDeep<T[P]> }
    : T;

export type DomainPopoverKey<
  TDomain extends string = string,
  TName extends string = string,
> = `${TDomain}:${TName}`;

export interface StoreSliceDescriptor<
  TSliceActions extends object = object,
  TSliceState extends object = object,
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  readonly name: string;
  readonly initialState?: Readonly<TSliceState>;
  readonly create: (
    ctx: import('../store/slices/context').SliceContext<TData, TContext, TPopoverKey, TSliceState>,
  ) => TSliceActions;
  readonly middleware?: PopoverMiddleware<TData, TContext, TPopoverKey>;
  readonly dispose?: (
    ctx: import('../store/slices/context').SliceContext<TData, TContext, TPopoverKey, TSliceState>,
  ) => void;
}

export function defineStoreSlice<
  TSliceActions extends object,
  TSliceState extends object = object,
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  descriptor: StoreSliceDescriptor<TSliceActions, TSliceState, TData, TContext, TPopoverKey>,
): StoreSliceDescriptor<TSliceActions, TSliceState, TData, TContext, TPopoverKey> {
  return Object.freeze(descriptor);
}

export type InferSliceActionsFromTuple<TSlices> = TSlices extends readonly (infer S)[]
  ? UnionToIntersection<
      S extends StoreSliceDescriptor<
        infer TActions,
        infer _State,
        infer _Data,
        infer _Context,
        infer _Key
      >
        ? TActions
        : object
    >
  : object;

export type InferSliceStateFromTuple<TSlices> = TSlices extends readonly (infer S)[]
  ? UnionToIntersection<
      S extends StoreSliceDescriptor<
        infer _Actions,
        infer TState,
        infer _Data,
        infer _Context,
        infer _Key
      >
        ? TState
        : object
    >
  : object;
