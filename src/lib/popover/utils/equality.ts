/**
 * Shallow equality comparison utility for plain objects and arrays.
 */
export function shallowEqual<T>(objA: T, objB: T): boolean {
  if (Object.is(objA, objB)) return true;
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA);
  if (keysA.length !== Object.keys(objB).length) return false;
  const recA = objA as Record<string, unknown>;
  const recB = objB as Record<string, unknown>;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(recA[key], recB[key])) {
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
    if (!Object.prototype.hasOwnProperty.call(recB, key) || !isDeepEqual(recA[key], recB[key])) {
      return false;
    }
  }
  return true;
}

/**
 * Lightweight zero-dependency deep equality comparison helper for plain objects, arrays, and primitives.
 */
export function isDeepEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && areArraysDeepEqual(a, b);
  }
  return areObjectsDeepEqual(a as Record<string, unknown>, b as Record<string, unknown>);
}
