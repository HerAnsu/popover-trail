/**
 * Plain Object, Prototype Immunity & Async Type Guards.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/objectGuards
 */

import { isUnsafeKey } from '../safeKeys';
import { isArray } from './arrayGuards';

const PLAIN_OBJECT_PROTOTYPE = Object.getPrototypeOf({});

/**
 * Validates whether an unknown value is a plain JavaScript dictionary object (created by `{}` or `Object.create(null)`),
 * explicitly rejecting class instances (`Date`, `RegExp`, `Map`, `Set`, `Error`) and arrays.
 *
 * @param val - Candidate value to evaluate.
 * @returns True if `val` is a plain JavaScript object.
 *
 * @example
 * ```typescript
 * isPlainObject({ a: 1 });       // => true
 * isPlainObject(Object.create(null)); // => true
 * isPlainObject([1, 2]);         // => false
 * isPlainObject(new Date());     // => false
 * ```
 */
export function isPlainObject(val: unknown): val is Record<string, unknown> {
  if (typeof val !== 'object' || val === null || isArray(val)) return false;
  const proto = Object.getPrototypeOf(val);
  return proto === null || proto === PLAIN_OBJECT_PROTOTYPE;
}

/**
 * Validates whether an object is a plain record immune to prototype pollution (contains no dangerous keys).
 *
 * @param val - Candidate value to evaluate.
 * @returns True if `val` is a plain object with zero unsafe keys.
 *
 * @example
 * ```typescript
 * isSafeRecord({ id: 'card-1' });              // => true
 * isSafeRecord({ __proto__: { admin: true } }); // => false
 * ```
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
 *
 * @example
 * ```typescript
 * isObjectRecord({ id: 1 }); // => true
 * isObjectRecord(null);      // => false
 * ```
 */
export function isObjectRecord(val: unknown): val is Record<PropertyKey, unknown> {
  return typeof val === 'object' && val !== null;
}

/**
 * Type guard verifying whether an unknown candidate has a specific function property.
 *
 * @template K - Property key type.
 * @param obj - Candidate object to inspect.
 * @param prop - Method property key to test.
 * @returns True if property exists and is a callable function.
 *
 * @example
 * ```typescript
 * if (hasFunctionProperty(emitter, 'emit')) {
 *   emitter.emit('event');
 * }
 * ```
 */
export function hasFunctionProperty<K extends PropertyKey>(
  obj: unknown,
  prop: K,
): obj is Record<K, (...args: readonly unknown[]) => unknown> {
  return isObjectRecord(obj) && typeof obj[prop] === 'function';
}

/**
 * Type guard verifying whether an unknown value is a Promise or Thenable.
 *
 * @template T - Resolved value type.
 * @param val - Candidate value to evaluate.
 * @returns True if `val` conforms to the PromiseLike interface.
 *
 * @example
 * ```typescript
 * if (isPromiseLike(result)) {
 *   result.then(doSomething);
 * }
 * ```
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
 *
 * @template K - Property key string.
 * @param obj - Candidate object to inspect.
 * @param key - Property key to verify.
 * @returns True if object has safe own property `key`.
 *
 * @example
 * ```typescript
 * if (hasSafeProperty(entry, 'status')) {
 *   console.log(entry.status);
 * }
 * ```
 */
export function hasSafeProperty<K extends string>(obj: unknown, key: K): obj is Record<K, unknown> {
  if (isUnsafeKey(key)) return false;
  if (typeof obj !== 'object' || obj === null) return false;
  return Object.hasOwn(obj, key);
}
