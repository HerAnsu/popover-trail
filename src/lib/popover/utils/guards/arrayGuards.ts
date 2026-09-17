/**
 * Array & Collection Type Guards.
 *
 * @module utils/guards/arrayGuards
 */

import { hasFunctionProperty } from './objectGuards';

/**
 * Type guard verifying if an array is non-empty with at least one element.
 *
 * @template T - Element type.
 * @param val - Candidate array or unknown value to test.
 * @returns True if `val` is an array containing at least one element.
 *
 * @example
 * ```typescript
 * isNonEmptyArray([1, 2, 3]); // => true
 * isNonEmptyArray([]);        // => false
 * isNonEmptyArray(null);      // => false
 * ```
 */
export function isNonEmptyArray<T>(val: readonly T[]): val is readonly [T, ...T[]];
export function isNonEmptyArray<T>(val: unknown): val is readonly [T, ...T[]];
export function isNonEmptyArray(val: unknown): boolean {
  return Array.isArray(val) && val.length > 0;
}

/**
 * Checks whether an unknown value is an array, narrowing to a readonly array.
 *
 * @template T - Element type.
 * @param val - Candidate value to evaluate.
 * @returns True if `val` is an Array.
 *
 * @example
 * ```typescript
 * if (isArray<string>(items)) {
 *   items.forEach(console.log);
 * }
 * ```
 */
export function isArray<T = unknown>(val: unknown): val is readonly T[] {
  return Array.isArray(val);
}

/**
 * Type guard verifying whether an unknown value implements the Iterable protocol.
 *
 * @template T - Iterable item type.
 * @param val - Candidate value to evaluate.
 * @returns True if `val` defines a callable `[Symbol.iterator]` method.
 *
 * @example
 * ```typescript
 * isIterable(new Set([1, 2])); // => true
 * isIterable('hello');         // => true
 * isIterable(42);              // => false
 * ```
 */
export function isIterable<T = unknown>(val: unknown): val is Iterable<T> {
  return hasFunctionProperty(val, Symbol.iterator);
}
