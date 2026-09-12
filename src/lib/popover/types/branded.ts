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

export const EMPTY_READONLY_ARRAY: readonly never[] = Object.freeze([]);
export const EMPTY_READONLY_OBJECT: Readonly<Partial<Record<string, unknown>>> = Object.freeze({});

/**
 * Type-safe accessor for the frozen empty record singleton.
 * Eliminates repetitive verbose type assertions across store slices, reducers, and initial states.
 */
export function emptyRecord<K extends string = string, V = unknown>(): Readonly<
  Partial<Record<K, V>>
> {
  return EMPTY_READONLY_OBJECT as Readonly<Partial<Record<K, V>>>;
}
