/**
 * Functional Set Algebra Utilities with Zero-GC Allocation Fast Paths.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/setOperations
 */

import { EMPTY_SET } from '../types/branded';

/**
 * Computes the union of two sets (A ∪ B).
 * Returns the original reference when one set is empty or both sets are identical.
 *
 * @example
 * ```ts
 * const s1 = new Set(['a', 'b']);
 * const s2 = new Set(['b', 'c']);
 * setUnion(s1, s2); // => Set { 'a', 'b', 'c' }
 * ```
 *
 * @template T - Element type.
 * @param a - First set.
 * @param b - Second set.
 * @returns Frozen set containing elements from both sets.
 */
export function setUnion<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): ReadonlySet<T> {
  if (a === b || b.size === 0) return a;
  if (a.size === 0) return b;

  const result = new Set<T>(a);
  for (const item of b) {
    result.add(item);
  }
  return Object.freeze(result);
}

/**
 * Computes the intersection of two sets (A ∩ B).
 * Iterates over the smaller set to minimize lookup operations.
 *
 * @example
 * ```ts
 * const s1 = new Set(['a', 'b']);
 * const s2 = new Set(['b', 'c']);
 * setIntersection(s1, s2); // => Set { 'b' }
 * ```
 *
 * @template T - Element type.
 * @param a - First set.
 * @param b - Second set.
 * @returns Frozen set containing elements present in both sets.
 */
export function setIntersection<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): ReadonlySet<T> {
  if (a === b) return a;
  if (a.size === 0 || b.size === 0) return EMPTY_SET;

  const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
  const result = new Set<T>();

  for (const item of smaller) {
    if (larger.has(item)) {
      result.add(item);
    }
  }

  if (result.size === 0) return EMPTY_SET;
  if (result.size === a.size && a.size === b.size) return a;
  return Object.freeze(result);
}

/**
 * Computes the relative complement of b in a (A \ B).
 * Returns elements present in `a` that are not present in `b`.
 *
 * @example
 * ```ts
 * const s1 = new Set(['a', 'b', 'c']);
 * const s2 = new Set(['b']);
 * setDifference(s1, s2); // => Set { 'a', 'c' }
 * ```
 *
 * @template T - Element type.
 * @param a - Base set.
 * @param b - Elements to exclude.
 * @returns Frozen set containing elements from `a` not in `b`.
 */
export function setDifference<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): ReadonlySet<T> {
  if (a.size === 0 || a === b) return EMPTY_SET;
  if (b.size === 0) return a;

  const result = new Set<T>();
  for (const item of a) {
    if (!b.has(item)) {
      result.add(item);
    }
  }

  if (result.size === 0) return EMPTY_SET;
  if (result.size === a.size) return a;
  return Object.freeze(result);
}

/**
 * Computes the symmetric difference of two sets (A △ B = (A \ B) ∪ (B \ A)).
 *
 * @example
 * ```ts
 * const s1 = new Set(['a', 'b']);
 * const s2 = new Set(['b', 'c']);
 * setSymmetricDifference(s1, s2); // => Set { 'a', 'c' }
 * ```
 *
 * @template T - Element type.
 * @param a - First set.
 * @param b - Second set.
 * @returns Frozen set containing elements present in either set, but not in both.
 */
export function setSymmetricDifference<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): ReadonlySet<T> {
  if (a === b) return EMPTY_SET;
  if (a.size === 0) return b;
  if (b.size === 0) return a;

  const result = new Set<T>();
  for (const item of a) {
    if (!b.has(item)) result.add(item);
  }
  for (const item of b) {
    if (!a.has(item)) result.add(item);
  }

  return result.size === 0 ? EMPTY_SET : Object.freeze(result);
}

/**
 * Determines whether `subset` is a subset of `superset` (A ⊆ B).
 *
 * @example
 * ```ts
 * isSubset(new Set(['a']), new Set(['a', 'b'])); // => true
 * ```
 *
 * @template T - Element type.
 * @param subset - Potential subset.
 * @param superset - Potential superset.
 * @returns True if all elements in `subset` exist in `superset`.
 */
export function isSubset<T>(subset: ReadonlySet<T>, superset: ReadonlySet<T>): boolean {
  if (subset === superset || subset.size === 0) return true;
  if (subset.size > superset.size) return false;
  for (const item of subset) {
    if (!superset.has(item)) return false;
  }
  return true;
}

/**
 * Determines whether `superset` is a superset of `subset` (A ⊇ B).
 *
 * @example
 * ```ts
 * isSuperset(new Set(['a', 'b']), new Set(['a'])); // => true
 * ```
 *
 * @template T - Element type.
 * @param superset - Potential superset.
 * @param subset - Potential subset.
 * @returns True if `superset` contains all elements of `subset`.
 */
export function isSuperset<T>(superset: ReadonlySet<T>, subset: ReadonlySet<T>): boolean {
  return isSubset(subset, superset);
}

/**
 * Determines whether two sets are disjoint (A ∩ B = ∅).
 *
 * @example
 * ```ts
 * isDisjoint(new Set(['a']), new Set(['b'])); // => true
 * isDisjoint(new Set(['a']), new Set(['a'])); // => false
 * ```
 *
 * @template T - Element type.
 * @param a - First set.
 * @param b - Second set.
 * @returns True if the sets share no common elements.
 */
export function isDisjoint<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): boolean {
  if (a === b) return a.size === 0;
  if (a.size === 0 || b.size === 0) return true;

  const [smaller, larger] = a.size <= b.size ? [a, b] : [b, a];
  for (const item of smaller) {
    if (larger.has(item)) return false;
  }
  return true;
}
