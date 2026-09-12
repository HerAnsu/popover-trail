/**
 * Shared prototype-pollution guards for untrusted dictionary keys.
 * Single source of truth consumed by reducers, middleware, caching,
 * equality checks, and persistence subsystems.
 *
 * @module utils/safeKeys
 */

import { isRecordObject, isNonEmptyString } from './guards/stringGuards';

/** Keys rejected unconditionally to prevent prototype pollution vulnerability attacks. */
export const UNSAFE_KEYS: ReadonlySet<string> = Object.freeze(
  new Set(['__proto__', 'constructor', 'prototype']),
);

/** Type guard verifying an unknown value is a non-null, non-array object record. */
export function isRecord(val: unknown): val is Record<string, unknown> {
  return isRecordObject(val);
}

/** Checks whether a key string carries a prototype-pollution vector. */
export function isUnsafeKey(key: string): boolean {
  return UNSAFE_KEYS.has(key);
}

/** Validates that every iterable member is a safe string key. */
export function areKeysSafe(keys: Iterable<unknown>): boolean {
  for (const key of keys) {
    if (!isNonEmptyString(key) || isUnsafeKey(key)) return false;
  }
  return true;
}

/**
 * Validates a user-supplied storage/cache key:
 * must be non-blank and free of pollution vectors.
 */
export function isValidStorageKey(key: string): boolean {
  return isNonEmptyString(key) && !isUnsafeKey(key);
}
