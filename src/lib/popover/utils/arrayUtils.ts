/**
 * Pure Array Manipulation and Slicing Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/arrayUtils
 */

import { EMPTY_READONLY_ARRAY } from '../types/branded';

/**
 * Returns the first element of an array, or undefined if empty.
 *
 * @template T - Element type.
 * @param items - Readonly source array.
 * @returns First element or undefined.
 */
export function first<T>(items: readonly T[]): T | undefined {
  return items.at(0);
}

/**
 * Returns the last element of an array, or undefined if empty.
 *
 * @template T - Element type.
 * @param items - Readonly source array.
 * @returns Last element or undefined.
 */
export function last<T>(items: readonly T[]): T | undefined {
  return items.at(-1);
}

/**
 * Returns a slice containing the first `count` elements.
 * Returns `EMPTY_READONLY_ARRAY` if `count <= 0`, or the source array unchanged if `count >= items.length`.
 *
 * @template T - Element type.
 * @param items - Source array.
 * @param count - Number of elements to take.
 * @returns Sliced array preserving reference identity when possible.
 */
export function take<T>(items: readonly T[], count: number): readonly T[] {
  if (count <= 0 || items.length === 0) return EMPTY_READONLY_ARRAY;
  if (count >= items.length) return items;
  return Object.freeze(items.slice(0, count));
}

/**
 * Returns a slice omitting the first `count` elements.
 * Returns the source array unchanged if `count <= 0`, or `EMPTY_READONLY_ARRAY` if `count >= items.length`.
 *
 * @template T - Element type.
 * @param items - Source array.
 * @param count - Number of elements to drop.
 * @returns Sliced array preserving reference identity when possible.
 */
export function drop<T>(items: readonly T[], count: number): readonly T[] {
  if (count <= 0 || items.length === 0) return items;
  if (count >= items.length) return EMPTY_READONLY_ARRAY;
  return Object.freeze(items.slice(count));
}

/**
 * Concatenates multiple arrays with zero-allocation fast-paths for empty inputs.
 * If all arrays are empty, returns EMPTY_READONLY_ARRAY.
 * If exactly one array is non-empty, returns it directly without heap allocation.
 *
 * @template T - Element type.
 * @param arrays - Readonly sequence of arrays to concatenate.
 * @returns Consolidated frozen array.
 */
export function concatImmutable<T>(...arrays: readonly (readonly T[])[]): readonly T[] {
  let nonEmptyCount = 0;
  let singleNonEmpty: readonly T[] | undefined;

  for (const arr of arrays) {
    if (arr && arr.length > 0) {
      nonEmptyCount++;
      singleNonEmpty = arr;
    }
  }

  if (nonEmptyCount === 0) return EMPTY_READONLY_ARRAY;
  if (nonEmptyCount === 1 && singleNonEmpty) return singleNonEmpty;

  const result: T[] = [];
  for (const arr of arrays) {
    if (arr && arr.length > 0) {
      for (const item of arr) {
        if (item !== undefined) {
          result.push(item);
        }
      }
    }
  }

  return Object.freeze(result);
}

