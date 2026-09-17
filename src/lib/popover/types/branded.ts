/**
 * Nominal Branded Types and Immutable Zero-Allocation Primitives for popover-trail.
 * Provides compile-time type safety for domain identifiers and eliminates double type assertions.
 *
 * @module types/branded
 */

declare const __brandSymbol: unique symbol;

/**
 * Attaches a phantom brand tag to primitive `T`, creating a nominal type
 * that prevents accidentally passing raw strings/numbers in place of domain identifiers.
 *
 * @template T - Underlying primitive type (`string`, `number`).
 * @template B - Unique brand identifier string.
 *
 * @example
 * ```typescript
 * type UserId = Brand<string, 'UserId'>;
 * function getUser(id: UserId) { ... }
 * ```
 */
export type Brand<T, B extends string> = T & { readonly [__brandSymbol]: B };

/**
 * Universal wildcard constraint matching any nominal branded type.
 */
export type AnyBrand = Brand<unknown, string>;

/**
 * Strips the nominal brand tag from branded type `T`, recovering the underlying primitive type.
 *
 * @template T - Potentially branded type.
 *
 * @example
 * ```typescript
 * type RawKey = Unbrand<PopoverKey>; // string
 * type RawNumber = Unbrand<DurationMs>; // number
 * ```
 */
export type Unbrand<T> = T extends { readonly [__brandSymbol]: string }
  ? T extends number
    ? number
    : T extends string
      ? string
      : T extends boolean
        ? boolean
        : T extends bigint
          ? bigint
          : T
  : T;

/**
 * Extracts the brand identifier string literal from branded type `T`.
 *
 * @template T - Branded type.
 *
 * @example
 * ```typescript
 * type Tag = BrandTagOf<PopoverKey>; // 'PopoverKey'
 * ```
 */
export type BrandTagOf<T> = T extends Brand<unknown, infer B> ? B : never;

/**
 * Compile-time type-level boolean evaluating whether `T` carries a nominal brand tag.
 *
 * @template T - Type to inspect.
 */
export type IsBranded<T> = T extends Brand<unknown, string> ? true : false;

/** Nominal type for popover unique string keys. */
export type PopoverKey<T extends string = string> = Brand<T, 'PopoverKey'>;

/** Nominal type for parent popover unique string keys. */
export type ParentKey<T extends string = string> = Brand<T, 'ParentKey'>;

/** Nominal type for trigger element owner IDs. */
export type OwnerId<T extends string = string> = Brand<T, 'OwnerId'>;

/** Nominal type for stack group categorization IDs. */
export type StackGroupId<T extends string = string> = Brand<T, 'StackGroupId'>;

/** Nominal type for z-index integer depth levels. */
export type ZIndexDepth = Brand<number, 'ZIndexDepth'>;

/** Nominal type for duration values in milliseconds. */
export type DurationMs = Brand<number, 'DurationMs'>;

/** Nominal type for Unix epoch timestamps in milliseconds. */
export type TimestampMs = Brand<number, 'TimestampMs'>;

/** Nominal type for horizontal viewport coordinates. */
export type ViewportX = Brand<number, 'ViewportX'>;

/** Nominal type for vertical viewport coordinates. */
export type ViewportY = Brand<number, 'ViewportY'>;

/** Nominal type for cross-tab synchronizer tab identifiers. */
export type TabId<T extends string = string> = Brand<T, 'TabId'>;

/** Nominal type for trigger element identifiers. */
export type TriggerId<T extends string = string> = Brand<T, 'TriggerId'>;

/** Nominal type for card scope instance identifiers. */
export type ScopeId<T extends string = string> = Brand<T, 'ScopeId'>;

/** Nominal type for subscription listener tokens and identifiers. */
export type SubscriptionId<T extends string = string> = Brand<T, 'SubscriptionId'>;

/** Nominal type for Web Worker message correlation IDs. */
export type WorkerTaskId = Brand<number, 'WorkerTaskId'>;

/** Nominal type for monotonically increasing causal logical clock counter sequences. */
export type CausalSequence = Brand<number, 'CausalSequence'>;

/** Nominal type for persistence key-value storage keys. */
export type StorageKey<T extends string = string> = Brand<T, 'StorageKey'>;

/** Nominal type for cross-tab broadcast channels. */
export type ChannelId<T extends string = string> = Brand<T, 'ChannelId'>;

/** Nominal type for memory and storage cache keys. */
export type CacheKey<T extends string = string> = Brand<T, 'CacheKey'>;

/** Nominal type for history journal ring-buffer capacity. */
export type HistoryCapacity = Brand<number, 'HistoryCapacity'>;

/**
 * Generic brand constructor eliminating double type assertions across domain modules.
 */
export function createBrand<T, B extends string>(value: T): Brand<T, B> {
  return value as Brand<T, B>;
}

/**
 * Strips nominal brand tag at runtime and compile-time, returning the underlying primitive value.
 *
 * @template T - Branded or primitive value type.
 * @param value - Value to unbrand.
 * @returns The unbranded primitive value.
 *
 * @example
 * ```typescript
 * const rawKey = unbrand(toPopoverKey('card-1')); // 'card-1' (string)
 * const rawMs = unbrand(toDurationMs(300)); // 300 (number)
 * ```
 */
export function unbrand<T>(value: T): Unbrand<T> {
  return value as Unbrand<T>;
}

export const EMPTY_ARRAY: readonly never[] = Object.freeze([]);
export const EMPTY_OBJECT: Readonly<Partial<Record<string, unknown>>> = Object.freeze({});
export const EMPTY_SET: ReadonlySet<never> = Object.freeze(new Set<never>());

/**
 * Type-safe accessor for the frozen empty record singleton.
 * Eliminates repetitive verbose type assertions across store slices, reducers, and initial states.
 */
export function emptyRecord<K extends string = string, V = unknown>(): Readonly<
  Partial<Record<K, V>>
> {
  return EMPTY_OBJECT as Readonly<Partial<Record<K, V>>>;
}

/**
 * Type-safe accessor for the frozen empty Set singleton.
 * Eliminates duplicate empty set instantiations across DAG and query methods.
 */
export function emptySet<T = never>(): ReadonlySet<T> {
  return EMPTY_SET as ReadonlySet<T>;
}

