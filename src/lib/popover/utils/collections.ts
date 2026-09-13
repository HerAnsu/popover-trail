/**
 * Collection Helpers for Searching and Querying Trail Lists.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/collections
 */

import type { TrailEntry } from '../types';
import { EMPTY_READONLY_ARRAY } from '../types/branded';
import { isUnsafeKey } from './safeKeys';
import { isNonNullable } from './predicates';

export function getEntryAtIndex<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  index: number,
): TrailEntry<TData, TPopoverKey> | undefined {
  if (index < 0 || index >= floating.length + trail.length) return undefined;
  if (index < floating.length) return floating[index];
  return trail[index - floating.length];
}

export function findEntryIndex<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): number {
  const fi = floating.findIndex((e) => e.key === key);
  if (fi !== -1) return fi;
  const ti = trail.findIndex((e) => e.key === key);
  return ti !== -1 ? floating.length + ti : -1;
}

export function hasEntryWithKey<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): boolean {
  return floating.some((e) => e.key === key) || trail.some((e) => e.key === key);
}

export function findEntryInStore<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): TrailEntry<TData, TPopoverKey> | undefined {
  return floating.find((e) => e.key === key) ?? trail.find((e) => e.key === key);
}

/**
 * Returns a deduplicated array preserving original order.

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
 * @template T - Element type.
 * @param items - Source array.
 * @param predicate - Filter condition.
 * @returns Readonly 2-tuple `[matching, nonMatching]`.
 */
export function partition<T>(
  items: readonly T[],
  predicate: (item: T) => boolean,
): readonly [readonly T[], readonly T[]] {
  if (items.length === 0) return [EMPTY_READONLY_ARRAY, EMPTY_READONLY_ARRAY];
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
 * Combines two arrays element-wise into pairs of 2-tuples up to the shorter array length.
 *
 * @template A - First element type.
 * @template B - Second element type.
 * @param a - First array.
 * @param b - Second array.
 * @returns Frozen array of tuples.
 */
export function zip<A, B>(a: readonly A[], b: readonly B[]): readonly (readonly [A, B])[] {
  const len = Math.min(a.length, b.length);
  if (len === 0) return EMPTY_READONLY_ARRAY;
  const result: (readonly [A, B])[] = [];
  for (let i = 0; i < len; i++) {
    result.push(Object.freeze([a[i] as A, b[i] as B]));
  }
  return Object.freeze(result);
}

/**
 * Generates an arithmetic progression sequence of numbers from start (inclusive) to end (exclusive).
 *
 * @param start - Starting value (inclusive).
 * @param end - Ending bound (exclusive).
 * @param step - Step increment (defaults to 1, must not be 0).
 * @returns Frozen array of numbers in progression.
 */
export function range(start: number, end: number, step = 1): readonly number[] {
  const safeStep = step === 0 ? 1 : step;
  if ((safeStep > 0 && start >= end) || (safeStep < 0 && start <= end)) {
    return EMPTY_READONLY_ARRAY;
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
 * @template T - Element type.
 * @param array - Array with potentially null or undefined items.
 * @returns Frozen array of non-nullable elements.
 */
export function compact<T>(array: readonly (T | null | undefined)[]): readonly T[] {
  if (array.length === 0) return EMPTY_READONLY_ARRAY;
  const result: T[] = [];
  for (const item of array) {
    if (isNonNullable(item)) {
      result.push(item);
    }
  }
  return result.length === 0 ? EMPTY_READONLY_ARRAY : Object.freeze(result);
}


