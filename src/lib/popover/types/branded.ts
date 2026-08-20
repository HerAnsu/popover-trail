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
export type Brand<T, B extends string> = T & { readonly [__brandSymbol]?: B };

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

/**
 * Immutable, frozen empty array singleton (`readonly never[]`).
 * Covariantly assignable to `readonly T[]` for any type `T` with zero allocation.
 */
export const EMPTY_READONLY_ARRAY: readonly never[] = Object.freeze([]);

/**
 * Immutable, frozen empty object singleton.
 * Safe for use as default record state across store slices with zero allocation.
 */
export const EMPTY_READONLY_OBJECT: Readonly<Partial<Record<string, unknown>>> = Object.freeze({});
