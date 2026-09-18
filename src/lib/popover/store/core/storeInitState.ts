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
import { safeAssign } from '../../utils/cleanObject';

/**
 * Normalizes store initialization arguments into a structured config object.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @template TSlices - Custom slices tuple type.
 * @param initialContextOrOptions - Either ambient context or full options object.
 * @param cache - Optional cache instance override.
 * @returns NormalizedStoreConfig bundle.
 *
 * @example
 * ```typescript
 * const config = normalizeStoreConfig({ initialContext: { user: 'Alice' } });
 * console.log(config.effectiveContext); // { user: 'Alice' }
 * ```
 */
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

/**
 * Builds the initial store state by merging the core default state with any custom slice initial states.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @template TSlices - Custom slices tuple type.
 * @param resolveData - Async data resolver function.
 * @param effectiveContext - Ambient context value or undefined.
 * @param effectiveCache - Resolved cache instance.
 * @param customSlices - Optional custom slice descriptors.
 * @returns Merged initial store state data.
 *
 * @example
 * ```typescript
 * const state = buildMergedInitialState(resolveData, ctx, cache, customSlices);
 * ```
 */
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
  let merged = { ...base } as PopoverStateData<TData, TContext, TPopoverKey> &
    InferSliceStateFromTuple<TSlices>;

  if (customSlices) {
    for (const { initialState } of customSlices) {
      if (initialState) {
        merged = safeAssign(merged, initialState);
      }
    }
  }
  return merged;
}
