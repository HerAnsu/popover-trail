/**
 * Plain Object, Prototype Immunity & Async Type Guards.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/objectGuards
 */

import { isUnsafeKey } from '../safeKeys';

const PLAIN_OBJECT_PROTOTYPE = Object.getPrototypeOf({});

/**
 * Validates whether an unknown value is a plain JavaScript dictionary object (created by {} or Object.create(null)),
 * explicitly rejecting class instances (Date, RegExp, Map, Set, Error) and arrays.
 */
export function isPlainObject(val: unknown): val is Record<string, unknown> {
  if (typeof val !== 'object' || val === null || Array.isArray(val)) return false;
  const proto = Object.getPrototypeOf(val);
  return proto === null || proto === PLAIN_OBJECT_PROTOTYPE;
}

/**
 * Validates whether an object is a plain record immune to prototype pollution (contains no dangerous keys).
 */
export function isSafeRecord(val: unknown): val is Record<string, unknown> {
  if (!isPlainObject(val)) return false;
  for (const key of Object.keys(val)) {
    if (isUnsafeKey(key)) return false;
  }
  return true;
}

/**
 * Type guard verifying whether an unknown candidate is a non-null object record.
 * Safe foundation for property checks and dictionary narrowing.
 *
 * @param val - Candidate value to evaluate.
 * @returns True if value is non-null object.
 */
export function isObjectRecord(val: unknown): val is Record<PropertyKey, unknown> {
  return typeof val === 'object' && val !== null;
}

/**
 * Type guard verifying whether an unknown candidate has a specific function property.
 *
 * @param obj - Candidate object to inspect.
 * @param prop - Method property key to test.
 * @returns True if property exists and is a callable function.
 */
export function hasFunctionProperty<K extends PropertyKey>(
  obj: unknown,
  prop: K,
): obj is Record<K, (...args: readonly unknown[]) => unknown> {
  return isObjectRecord(obj) && typeof obj[prop] === 'function';
}

/**
 * Type guard verifying whether an unknown value is a Promise or Thenable.
 */
export function isPromiseLike<T = unknown>(val: unknown): val is PromiseLike<T> {
  return (
    (typeof val === 'object' || typeof val === 'function') &&
    val !== null &&
    'then' in val &&
    typeof val.then === 'function'
  );
}

/**
 * Safe property accessor guard verifying own property existence and guarding against prototype pollution keys.
 */
export function hasSafeProperty<K extends string>(obj: unknown, key: K): obj is Record<K, unknown> {
  if (isUnsafeKey(key)) return false;
  if (typeof obj !== 'object' || obj === null) return false;
  return Object.hasOwn(obj, key);
}

