/**
 * Shared prototype-pollution guards for untrusted dictionary keys.
 * Single source of truth consumed by reducers, middleware, caching,
 * equality checks, and persistence subsystems.
 *
 * @module utils/safeKeys
 */

import { isRecordObject, isNonEmptyString } from './guards/stringGuards';

/**
 * Keys rejected unconditionally to prevent prototype pollution vulnerability attacks.
 *
 * @example
 * ```typescript
 * if (UNSAFE_KEYS.has(userInputKey)) {
 *   throw new Error('Disallowed prototype key');
 * }
 * ```
 */
export const UNSAFE_KEYS: ReadonlySet<string> = Object.freeze(
  new Set(['__proto__', 'constructor', 'prototype']),
);

/**
 * Type guard verifying an unknown value is a non-null, non-array object record.
 *
 * @param val - Candidate value to evaluate.
 * @returns True if `val` is a standard JavaScript dictionary/record object.
 *
 * @example
 * ```typescript
 * if (isRecord(payload)) {
 *   console.log(payload.title);
 * }
 * ```
 */
export function isRecord(val: unknown): val is Record<string, unknown> {
  return isRecordObject(val);
}

/**
 * Checks whether a key string carries a prototype-pollution vector (`__proto__`, `constructor`, or `prototype`).
 *
 * @param key - Property key to check.
 * @returns True if the key is dangerous and must be rejected.
 *
 * @example
 * ```typescript
 * isUnsafeKey('__proto__'); // => true
 * isUnsafeKey('safeProperty'); // => false
 * ```
 */
export function isUnsafeKey(key: string): boolean {
  return UNSAFE_KEYS.has(key);
}

/**
 * Validates that every iterable member is a non-empty string and free of prototype-pollution vectors.
 *
 * @param keys - Iterable collection of key candidates.
 * @returns True if all keys are valid and safe.
 *
 * @example
 * ```typescript
 * areKeysSafe(['id', 'title', 'count']); // => true
 * areKeysSafe(['id', '__proto__']); // => false
 * ```
 */
export function areKeysSafe(keys: Iterable<unknown>): boolean {
  for (const key of keys) {
    if (!isNonEmptyString(key) || isUnsafeKey(key)) return false;
  }
  return true;
}

/**
 * Validates a user-supplied storage or cache key:
 * must be non-blank and free of pollution vectors.
 *
 * @param key - Candidate storage key string.
 * @returns True if `key` is non-empty, trimmed, and safe for persistence engines.
 *
 * @example
 * ```typescript
 * isValidStorageKey('popover:trail:state'); // => true
 * isValidStorageKey('constructor'); // => false
 * isValidStorageKey('   '); // => false
 * ```
 */
export function isValidStorageKey(key: string): boolean {
  return isNonEmptyString(key) && !isUnsafeKey(key);
}
