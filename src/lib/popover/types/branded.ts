/**
 * Nominal Branded Types and Immutable Zero-Allocation Primitives for popover-trail.
 * Provides compile-time type safety for domain identifiers and eliminates double type assertions.
 *
 * @module types/branded
 */

/**
 * Nominal Branded Type utility.
 * Attaches a unique phantom type brand to a primitive, protecting against accidental argument swapping.
 *
 * @template T - Base primitive type.
 * @template B - Unique brand string label.
 */
export type Brand<T, B extends string> = T & { readonly __brand: B };

/** Nominal type for popover unique string identifiers. */
export type PopoverKey<T extends string = string> = Brand<T, 'PopoverKey'>;

/** Nominal type for parent popover unique string identifiers. */
export type ParentKey<T extends string = string> = Brand<T, 'ParentKey'>;

/** Nominal type for stack group filter string identifiers. */
export type StackGroupId<T extends string = string> = Brand<T, 'StackGroupId'>;

/** Nominal type for z-index integer depth values. */
export type ZIndexDepth = Brand<number, 'ZIndexDepth'>;

/**
 * Single source of truth frozen empty array primitive.
 * Safe for use as default state across store slices without double type assertions.
 */
export const EMPTY_READONLY_ARRAY: readonly never[] = Object.freeze([]);

/**
 * Single source of truth frozen empty object primitive.
 * Safe for use as default state across store slices without double type assertions.
 */
export const EMPTY_READONLY_OBJECT: Readonly<Record<string, never>> = Object.freeze({});
