/**
 * Zero-GC Shallow and Deep Equality Comparison Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/equality
 */

import { isUnsafeKey } from './safeKeys';
import { isRecordObject, isArray } from './typeGuards';

export function shallowEqualArray<T>(a?: readonly T[], b?: readonly T[]): boolean {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
}

export function areSetsEqual<T>(a?: ReadonlySet<T>, b?: ReadonlySet<T>): boolean {
  if (a === b) return true;
  if (!a || !b || a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

export function shallowEqual<T>(objA: T, objB: T): boolean {
  if (Object.is(objA, objB)) return true;
  if (!objA || !objB || typeof objA !== 'object' || typeof objB !== 'object') return false;
  if (isArray(objA) || isArray(objB)) {
    return isArray(objA) && isArray(objB) && shallowEqualArray(objA, objB);
  }
  if (!isRecordObject(objA) || !isRecordObject(objB)) return false;
  return areObjectsEqual(objA, objB);
}

function areObjectsEqual(
  recA: Record<string, unknown>,
  recB: Record<string, unknown>,
): boolean {
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

export function isCollisionConfigEqual(a?: unknown, b?: unknown): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return isDeepEqual(a, b);
}
