/**
 * Zero-GC Shallow and Deep Equality Comparison Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/equality
 */

import { isUnsafeKey } from './safeKeys';
import { isRecordObject, isArray } from './typeGuards';
import { isSubset } from './setOperations';

/**
 * Performs a zero-allocation shallow equality comparison between two readonly arrays using `Object.is`.
 *
 * @template T - Element type.
 * @param a - First array.
 * @param b - Second array.
 * @returns True if both arrays have identical length and identical elements.
 *
 * @example
 * ```typescript
 * shallowEqualArray([1, 2], [1, 2]); // true
 * shallowEqualArray([1, 2], [1, 3]); // false
 * ```
 */
export function shallowEqualArray<T>(a?: readonly T[], b?: readonly T[]): boolean {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
}

/**
 * Checks whether two sets contain the exact same items.
 *
 * @template T - Value type.
 * @param a - First Set.
 * @param b - Second Set.
 * @returns True if both sets have identical size and members.
 *
 * @example
 * ```typescript
 * areSetsEqual(new Set(['a', 'b']), new Set(['b', 'a'])); // true
 * ```
 */
export function areSetsEqual<T>(a?: ReadonlySet<T>, b?: ReadonlySet<T>): boolean {
  if (a === b) return true;
  if (!a || !b || a.size !== b.size) return false;
  return isSubset(a, b);
}

/**
 * Performs a high-performance shallow equality comparison between two values, objects, or arrays.
 * Traverses object keys without allocating intermediate arrays (`Object.keys()`).
 *
 * @template T - Input value type.
 * @param objA - First value.
 * @param objB - Second value.
 * @returns True if shallowly equal.
 *
 * @example
 * ```typescript
 * shallowEqual({ x: 10, y: 20 }, { x: 10, y: 20 }); // true
 * shallowEqual({ x: 10 }, { x: 20 }); // false
 * ```
 */
export function shallowEqual<T>(objA: T, objB: T): boolean {
  if (Object.is(objA, objB)) return true;
  if (!objA || !objB || typeof objA !== 'object' || typeof objB !== 'object') return false;
  if (isArray(objA) || isArray(objB)) {
    return isArray(objA) && isArray(objB) && shallowEqualArray(objA, objB);
  }
  if (!isRecordObject(objA) || !isRecordObject(objB)) return false;
  return areObjectsEqual(objA, objB);
}

function areObjectsEqual(recA: Record<string, unknown>, recB: Record<string, unknown>): boolean {
  let countA = 0;
  let countB = 0;

  for (const key in recA) {
    if (Object.hasOwn(recA, key) && !isUnsafeKey(key)) {
      countA++;
      if (!Object.hasOwn(recB, key) || !Object.is(recA[key], recB[key])) return false;
    }
  }
  for (const key in recB) {
    if (Object.hasOwn(recB, key) && !isUnsafeKey(key)) countB++;
  }
  return countA === countB;
}

function areObjectsDeepEqual(
  recA: Record<string, unknown>,
  recB: Record<string, unknown>,
): boolean {
  let countA = 0;
  let countB = 0;
  for (const key in recA) {
    if (Object.hasOwn(recA, key) && !isUnsafeKey(key)) {
      countA++;
      if (!Object.hasOwn(recB, key) || !isDeepEqual(recA[key], recB[key])) return false;
    }
  }
  for (const key in recB) {
    if (Object.hasOwn(recB, key) && !isUnsafeKey(key)) countB++;
  }
  return countA === countB;
}

/**
 * Performs a recursive deep equality comparison between two arbitrary structures.
 *
 * @template T - Input value type.
 * @param a - First value.
 * @param b - Second value.
 * @returns True if both structures are deeply structurally identical.
 *
 * @example
 * ```typescript
 * isDeepEqual({ nested: { a: 1 } }, { nested: { a: 1 } }); // true
 * ```
 */
export function isDeepEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (isArray(a) || isArray(b)) {
    if (!isArray(a) || !isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!isDeepEqual(a[i], b[i])) return false;
    return true;
  }
  if (isRecordObject(a) && isRecordObject(b)) return areObjectsDeepEqual(a, b);
  return false;
}

/**
 * Compares two collision configuration objects for structural equality.
 *
 * @param a - First config.
 * @param b - Second config.
 * @returns True if both configurations match.
 */
export function isCollisionConfigEqual(a?: unknown, b?: unknown): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return isDeepEqual(a, b);
}
