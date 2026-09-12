/**
 * Options interfaces and type guards for store composition root.
 *
 * @module storeOptions
 */

import type { PopoverCache, StoreSliceDescriptor } from '../../types';

export interface PopoverStoreOptions<
  TData = unknown,
  TContext = unknown,
  _TPopoverKey extends string = string,
  TSlices extends readonly unknown[] = readonly unknown[],
> {
  readonly cache?: PopoverCache<TData>;
  readonly initialContext?: TContext;
  readonly customSlices?: TSlices;
}

export function isStoreOptions<
  TData,
  TContext,
  TPopoverKey extends string,
  TSlices extends readonly unknown[],
>(val: unknown): val is PopoverStoreOptions<TData, TContext, TPopoverKey, TSlices> {
  return (
    typeof val === 'object' &&
    val !== null &&
    ('customSlices' in val || 'cache' in val || 'initialContext' in val)
  );
}

export interface StoreContextAndCache<TData, TContext> {
  effectiveContext: TContext | undefined;
  effectiveCache: PopoverCache<TData>;
}

export interface NormalizedStoreConfig<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TSlices extends readonly unknown[] = readonly unknown[],
> {
  options: PopoverStoreOptions<TData, TContext, TPopoverKey, TSlices> | undefined;
  effectiveContext: TContext | undefined;
  effectiveCache: PopoverCache<TData>;
  customSlices:
    | readonly StoreSliceDescriptor<object, object, TData, TContext, TPopoverKey>[]
    | undefined;
}
