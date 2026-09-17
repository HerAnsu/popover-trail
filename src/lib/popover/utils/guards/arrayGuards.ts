/**
 * Array & Collection Type Guards.
 *
 * @module utils/guards/arrayGuards
 */

import { hasFunctionProperty } from './objectGuards';

/** Checks if an array is non-empty with at least one element. */
export function isNonEmptyArray<T>(val: readonly T[]): val is readonly [T, ...T[]];
export function isNonEmptyArray<T>(val: unknown): val is readonly [T, ...T[]];
export function isNonEmptyArray(val: unknown): boolean {
  return Array.isArray(val) && val.length > 0;
}

/** Checks whether an unknown value is an array, narrowing to a readonly array. */
export function isArray<T = unknown>(val: unknown): val is readonly T[] {
  return Array.isArray(val);
}

/** Checks whether an unknown value implements the Iterable protocol. */
export function isIterable<T = unknown>(val: unknown): val is Iterable<T> {
  return hasFunctionProperty(val, Symbol.iterator);
}
