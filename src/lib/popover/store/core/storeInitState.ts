/**
 * Initial State Resolution and Custom Slice Aggregation.
 *
 * @module storeInitState
 */

import type {
  PopoverResolver,
  PopoverCache,
  PopoverStateData,
  StoreSliceDescriptor,
  InferSliceStateFromTuple,
} from '../../types';
import { SimplePopoverCache } from '../../utils/cache';
import { getInitialStoreState } from '../storeDefaults';
import {
  isStoreOptions,
  type PopoverStoreOptions,
  type NormalizedStoreConfig,
} from './storeOptions';

export function isEmptyOwnObject(value: object): boolean {
  for (const key in value) {
    if (Object.hasOwn(value, key)) return false;
  }
  return true;
}

export function normalizeStoreConfig<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  const TSlices extends readonly unknown[] = readonly unknown[],
>(
  initialContextOrOptions?: TContext | PopoverStoreOptions<TData, TContext, TPopoverKey, TSlices>,
  cache?: PopoverCache<TData>,
): NormalizedStoreConfig<TData, TContext, TPopoverKey, TSlices> {
  const isOpts = isStoreOptions<TData, TContext, TPopoverKey, TSlices>(initialContextOrOptions);
  const options = isOpts ? initialContextOrOptions : undefined;
  const effectiveContext: TContext | undefined = isOpts
    ? initialContextOrOptions.initialContext
    : initialContextOrOptions;
  const effectiveCache = options?.cache ?? cache ?? new SimplePopoverCache<TData>();
  const customSlices = options?.customSlices as
    | readonly StoreSliceDescriptor<object, object, TData, TContext, TPopoverKey>[]
    | undefined;

  return { options, effectiveContext, effectiveCache, customSlices };
}

export function buildMergedInitialState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  const TSlices extends readonly unknown[] = readonly unknown[],
>(
  resolveData: PopoverResolver<TData, TContext>,
  effectiveContext: TContext | undefined,
  effectiveCache: PopoverCache<TData>,
  customSlices?: readonly StoreSliceDescriptor<object, object, TData, TContext, TPopoverKey>[],
): PopoverStateData<TData, TContext, TPopoverKey> & InferSliceStateFromTuple<TSlices> {
  const base = getInitialStoreState<TData, TContext, TPopoverKey>(
    resolveData,
    effectiveContext,
    effectiveCache,
  );
  const merged = { ...base } as PopoverStateData<TData, TContext, TPopoverKey> &
    InferSliceStateFromTuple<TSlices>;

  if (customSlices) {
    for (const slice of customSlices) {
      if (slice.initialState) Object.assign(merged, slice.initialState);
    }
  }
  return merged;
}
