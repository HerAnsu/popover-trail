/**
 * Collection Helpers for Searching and Querying Trail Lists.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/collections
 */

import type { TrailEntry } from '../types';
import { EMPTY_ARRAY } from '../types/branded';
import { isUnsafeKey } from './safeKeys';
import { isNonNullable, isMatchingKey, isPopoverActive } from './predicates';

/**
 * Retrieves an entry at a unified index spanning floating and cascading trail collections.
 *
 * @example
 * ```ts
 * const entry = getEntryAtIndex(state.floating, state.trail, 2);
 * ```
 *
 * @param floating - Readonly array of floating pinned popover entries.
 * @param trail - Readonly array of cascading trail popover entries.
 * @param index - Continuous index across floating (0..F-1) and trail (F..F+T-1).
 * @returns Found TrailEntry or undefined if index is out of bounds.
 */
export function getEntryAtIndex<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  index: number,
): TrailEntry<TData, TPopoverKey> | undefined {
  if (index < 0 || index >= floating.length + trail.length) return undefined;
  if (index < floating.length) return floating[index];
  return trail[index - floating.length];
}

/**
 * Finds the continuous index of a popover key across floating and trail collections.
 *
 * @example
 * ```ts
 * const idx = findEntryIndex(state.floating, state.trail, 'menuItem');
 * if (idx !== -1) {
 *   console.log('Found entry at index:', idx);
 * }
 * ```
 *
 * @param floating - Readonly array of floating popover entries.
 * @param trail - Readonly array of cascading trail popover entries.
 * @param key - Popover key to locate.
 * @returns Index 0..total-1 if found, or -1 if absent.
 */
export function findEntryIndex<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): number {
  const isTarget = isMatchingKey(key);
  const fi = floating.findIndex(isTarget);
  if (fi !== -1) return fi;
  const ti = trail.findIndex(isTarget);
  return ti !== -1 ? floating.length + ti : -1;
}

/**
 * Checks whether an entry with the target key is present in either floating or trail collection.
 *
 * @example
 * ```ts
 * if (hasEntryWithKey(state.floating, state.trail, 'profileMenu')) {
 *   // Card is currently active
 * }
 * ```
 *
 * @param floating - Readonly array of floating popovers.
 * @param trail - Readonly array of cascading popovers.
 * @param key - Popover key to check.
 * @returns True if active in either collection.
 */
export function hasEntryWithKey<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): boolean {
  return isPopoverActive({ floating, trail }, key);
}

/**
 * Finds and returns the first TrailEntry matching `key` across floating and trail collections.
 *
 * @example
 * ```ts
 * const entry = findEntryInStore(state.floating, state.trail, 'userCard');
 * ```
 *
 * @param floating - Readonly array of floating popovers.
 * @param trail - Readonly array of cascading popovers.
 * @param key - Popover key to search for.
 * @returns Matching TrailEntry or undefined if absent.
 */
export function findEntryInStore<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): TrailEntry<TData, TPopoverKey> | undefined {
  const isTarget = isMatchingKey(key);
  return floating.find(isTarget) ?? trail.find(isTarget);
}

/**
 * Returns a deduplicated array preserving original insertion order.
 *
 * @example
 * ```ts
 * unique(['a', 'b', 'a', 'c']); // => ['a', 'b', 'c']
 * ```
 *
 * @template T - Element type.
 * @param items - Readonly array of items.
 * @returns Frozen array of unique elements.
 */
export function unique<T>(items: readonly T[]): readonly T[] {
  if (items.length <= 1) return items;
  return Object.freeze([...new Set(items)]);
}

/**
 * Splits an array into a 2-tuple `[truthy, falsy]` according to predicate.
 *
 * @example
 * ```ts
 * const [even, odd] = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0);
 * // even => [2, 4], odd => [1, 3, 5]
 * ```
 *
 * @template T - Element type.
 * @param items - Source array.
 * @param predicate - Filter condition.
 * @returns Readonly 2-tuple `[matching, nonMatching]`.
 */
export function partition<T>(
  items: readonly T[],
  predicate: (item: T) => boolean,
): readonly [readonly T[], readonly T[]] {
  if (items.length === 0) return [EMPTY_ARRAY, EMPTY_ARRAY];
  const matching: T[] = [];
  const nonMatching: T[] = [];
  for (const item of items) {
    if (predicate(item)) {
      matching.push(item);
    } else {
      nonMatching.push(item);
    }
  }
  return Object.freeze([Object.freeze(matching), Object.freeze(nonMatching)]);
}

/**
 * Groups elements of an array by key extracted via `getKey` selector.
 * Protects against prototype pollution by discarding unsafe object keys.
 *
 * @example
 * ```ts
 * const words = ['apple', 'avocado', 'banana'];
 * const byFirstLetter = groupBy(words, (w) => w[0]);
 * // => { a: ['apple', 'avocado'], b: ['banana'] }
 * ```
 *
 * @template T - Item type.
 * @template K - Group key.
 */
export function groupBy<T, K extends string | number>(
  items: readonly T[],
  getKey: (item: T) => K,
): Record<K, readonly T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = String(getKey(item));
    if (isUnsafeKey(key)) continue;
    let group = result[key];
    if (!group) {
      group = [];
      result[key] = group;
    }
    group.push(item);
  }
  for (const key of Object.keys(result)) {
    const group = result[key];
    if (group) {
      Object.freeze(group);
    }
  }
  return result as Record<K, readonly T[]>;
}

/**
 * Creates a dictionary mapping keys to array items using `getKey` selector.
 * Later items overwrite earlier items with the same key.
 *
 * @example
 * ```ts
 * const users = [{ id: 'u1', name: 'Alice' }, { id: 'u2', name: 'Bob' }];
 * const usersById = keyBy(users, (u) => u.id);
 * // => { u1: { id: 'u1', name: 'Alice' }, u2: { id: 'u2', name: 'Bob' } }
 * ```
 *
 * @template T - Item type.
 * @template K - Key type.
 */
export function keyBy<T, K extends string | number>(
  items: readonly T[],
  getKey: (item: T) => K,
): Record<K, T> {
  const result: Record<string, T> = {};
  for (const item of items) {
    const key = String(getKey(item));
    if (isUnsafeKey(key)) continue;
    result[key] = item;
  }
  return result as Record<K, T>;
}

/**
 * Splits an array into chunks of specified maximum size.
 *
 * @example
 * ```ts
 * chunk([1, 2, 3, 4, 5], 2); // => [[1, 2], [3, 4], [5]]
 * ```
 *
 * @template T - Element type.
 * @param items - Array to chunk.
 * @param size - Chunk size (must be >= 1).
 * @returns Array of chunks.
 */
export function chunk<T>(items: readonly T[], size: number): readonly (readonly T[])[] {
  const safeSize = Math.max(1, Math.floor(size));
  if (items.length === 0) return Object.freeze([]);
  const result: (readonly T[])[] = [];
  for (let i = 0; i < items.length; i += safeSize) {
    result.push(Object.freeze(items.slice(i, i + safeSize)));
  }
  return Object.freeze(result);
}

/**
 * Zips two arrays into an array of 2-tuples up to the length of the shorter array.
 *
 * @example
 * ```ts
 * zip(['a', 'b'], [1, 2, 3]); // => [['a', 1], ['b', 2]]
 * ```
 *
 * @template A - First array element type.
 * @template B - Second array element type.
 * @param a - First source array.
 * @param b - Second source array.
 * @returns Frozen array of paired tuples.
 */
export function zip<A, B>(a: readonly A[], b: readonly B[]): readonly (readonly [A, B])[] {
  const len = Math.min(a.length, b.length);
  if (len === 0) return EMPTY_ARRAY;
  const result: (readonly [A, B])[] = [];
  for (let i = 0; i < len; i++) {
    result.push(Object.freeze([a[i] as A, b[i] as B]));
  }
  return Object.freeze(result);
}

/**
 * Generates an arithmetic progression sequence of numbers from start (inclusive) to end (exclusive).
 *
 * @example
 * ```ts
 * range(0, 5);    // => [0, 1, 2, 3, 4]
 * range(0, 10, 2); // => [0, 2, 4, 6, 8]
 * ```
 *
 * @param start - Starting value (inclusive).
 * @param end - Ending bound (exclusive).
 * @param step - Step increment (defaults to 1, must not be 0).
 * @returns Frozen array of numbers in progression.
 */
export function range(start: number, end: number, step = 1): readonly number[] {
  const safeStep = step === 0 ? 1 : step;
  if ((safeStep > 0 && start >= end) || (safeStep < 0 && start <= end)) {
    return EMPTY_ARRAY;
  }
  const result: number[] = [];
  if (safeStep > 0) {
    for (let n = start; n < end; n += safeStep) {
      result.push(n);
    }
  } else {
    for (let n = start; n > end; n += safeStep) {
      result.push(n);
    }
  }
  return Object.freeze(result);
}

/**
 * Removes null and undefined elements from an array with zero allocations on empty input.
 *
 * @example
 * ```ts
 * compact(['a', null, 'b', undefined, 'c']); // => ['a', 'b', 'c']
 * ```
 *
 * @template T - Element type.
 * @param array - Array with potentially null or undefined items.
 * @returns Frozen array of non-nullable elements.
 */
export function compact<T>(array: readonly (T | null | undefined)[]): readonly T[] {
  if (array.length === 0) return EMPTY_ARRAY;
  const result: T[] = [];
  for (const item of array) {
    if (isNonNullable(item)) {
      result.push(item);
    }
  }
  return result.length === 0 ? EMPTY_ARRAY : Object.freeze(result);
}

