/**
 * Options interfaces and type guards for store composition root.
 *
 * @module storeOptions
 */

import type { PopoverCache, StoreSliceDescriptor } from '../../types';

/**
 * Configuration options for initializing a headless popover store.
 *
 * @template TData - Popover resolved payload data type.
 * @template TContext - Global shared ambient context type.
 * @template _TPopoverKey - Union of valid popover string keys.
 * @template TSlices - Tuple of custom store slice extensions.
 *
 * @example
 * ```typescript
 * const options: PopoverStoreOptions<User, AppContext> = {
 *   initialContext: { theme: 'dark', authLevel: 1 },
 *   cache: new SimplePopoverCache(),
 * };
 * ```
 */
export interface PopoverStoreOptions<
  TData = unknown,
  TContext = unknown,
  _TPopoverKey extends string = string,
  TSlices extends readonly unknown[] = readonly unknown[],
> {
  /** Optional custom cache implementation for deduplicating async requests. */
  readonly cache?: PopoverCache<TData>;
  /** Optional ambient context provided to resolvers and action middlewares. */
  readonly initialContext?: TContext;
  /** Optional custom store slices extending state and actions. */
  readonly customSlices?: TSlices;
}

/**
 * Type guard verifying whether an unknown value conforms to `PopoverStoreOptions`.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @template TSlices - Custom slices tuple type.
 * @param val - Unknown value to inspect.
 * @returns True if value conforms to PopoverStoreOptions.
 *
 * @example
 * ```typescript
 * if (isStoreOptions(arg)) {
 *   console.log(arg.customSlices, arg.initialContext);
 * }
 * ```
 */
export function isStoreOptions<
  TData,
  TContext,
  TPopoverKey extends string,
  TSlices extends readonly unknown[],
>(val: unknown): val is PopoverStoreOptions<TData, TContext, TPopoverKey, TSlices> {
  if (typeof val !== 'object' || val === null) return false;
  return 'customSlices' in val || 'cache' in val || 'initialContext' in val;
}

/**
 * Pair of resolved ambient context and data cache.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 */
export interface StoreContextAndCache<TData, TContext> {
  /** Effective resolved context or undefined. */
  readonly effectiveContext: TContext | undefined;
  /** Effective resolved data cache instance. */
  readonly effectiveCache: PopoverCache<TData>;
}

/**
 * Normalized store configuration unpacked from context or options arguments.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @template TSlices - Custom slices tuple type.
 */
export interface NormalizedStoreConfig<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TSlices extends readonly unknown[] = readonly unknown[],
> {
  /** Original options object if provided, otherwise undefined. */
  readonly options: PopoverStoreOptions<TData, TContext, TPopoverKey, TSlices> | undefined;
  /** Effective resolved ambient context. */
  readonly effectiveContext: TContext | undefined;
  /** Effective cache instance used for resolving entries. */
  readonly effectiveCache: PopoverCache<TData>;
  /** Array of custom slice descriptors if specified. */
  readonly customSlices:
    | readonly StoreSliceDescriptor<object, object, TData, TContext, TPopoverKey>[]
    | undefined;
}
