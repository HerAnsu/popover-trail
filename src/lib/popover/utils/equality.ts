function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

/**
 * Shallow equality comparison utility for plain objects, arrays, and primitive values.
 *
 * @remarks
 * Uses `Object.is` for value equality and performs shallow key comparisons on object dictionaries.
 *
 * @param objA - First object to compare.
 * @param objB - Second object to compare.
 * @returns True if both values are shallowly identical.
 */
export function shallowEqual<T>(objA: T, objB: T): boolean {
  if (Object.is(objA, objB)) return true;
  if (!isRecord(objA) || !isRecord(objB)) {
    return false;
  }
  const keysA = Object.keys(objA);
  if (keysA.length !== Object.keys(objB).length) return false;
  for (const key of keysA) {
    if (!Object.hasOwn(objB, key) || !Object.is(objA[key], objB[key])) {
      return false;
    }
  }
  return true;
}

function areArraysDeepEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!isDeepEqual(a[i], b[i])) return false;
  }
  return true;
}

function areObjectsDeepEqual(
  recA: Record<string, unknown>,
  recB: Record<string, unknown>,
): boolean {
  const keysA = Object.keys(recA);
  if (keysA.length !== Object.keys(recB).length) return false;
  for (const key of keysA) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    if (!Object.hasOwn(recB, key) || !isDeepEqual(recA[key], recB[key])) {
      return false;
    }
  }
  return true;
}

/**
 * Lightweight zero-dependency deep equality comparison helper for plain objects, arrays, and primitives.
 *
 * @remarks
 * Recursively compares nested objects and arrays while ignoring unsafe prototype properties.
 *
 * @param a - First value to compare.
 * @param b - Second value to compare.
 * @returns True if deeply structural-equal.
 */
export function isDeepEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && areArraysDeepEqual(a, b);
  }
  if (isRecord(a) && isRecord(b)) {
    return areObjectsDeepEqual(a, b);
  }
  return false;
}
