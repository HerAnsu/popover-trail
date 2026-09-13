/**
 * Safe Object Manipulation Utilities for Prototype Pollution Resistance.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/cleanObject
 */

import { isUnsafeKey } from './safeKeys';

/**
 * Creates a shallow copy of a record omitting the specified key.
 * Avoids the `delete` operator to preserve V8 hidden classes.
 *
 * @template T - Value type of the record.
 * @template K - Key type of the record.
 * @param record - Source record.
 * @param keyToOmit - Key to exclude from the new record.
 * @returns A new record with the key omitted, or the original record if unchanged.
 */
export function toOmittedRecordKey<T, K extends string = string>(
  record: Partial<Record<K, T>>,
  keyToOmit: K,
): Partial<Record<K, T>> {
  if (!record || !(keyToOmit in record)) {
    return record;
  }

  const result: Partial<Record<K, T>> = {};
  for (const key in record) {
    if (Object.hasOwn(record, key) && key !== keyToOmit && !isUnsafeKey(key)) {
      result[key] = record[key];
    }
  }

  return result;
}

export const omitRecordKey = toOmittedRecordKey;

/**
 * Creates a shallow copy of a record omitting multiple specified keys.
 *
 * @template T - Value type of the record.
 * @template K - Key type of the record.
 * @param record - Source record.
 * @param keysToOmit - Set or array of keys to exclude.
 * @returns A new record with the keys omitted.
 */
export function toOmittedRecordKeys<T, K extends string = string>(
  record: Partial<Record<K, T>>,
  keysToOmit: ReadonlySet<K> | readonly K[],
): Partial<Record<K, T>> {
  const filterSet: ReadonlySet<string> =
    keysToOmit instanceof Set ? keysToOmit : new Set(keysToOmit);
  const result: Partial<Record<K, T>> = {};
  for (const key in record) {
    if (Object.hasOwn(record, key) && !filterSet.has(key) && !isUnsafeKey(key)) {
      result[key] = record[key];
    }
  }
  return result;
}

/**
 * Safely assigns source properties to a target object protecting against prototype pollution.
 *
 * @template T - Target object type.
 * @template S - Source object type.
 * @param target - Base destination object.
 * @param source - Incoming source properties.
 * @returns Merged intersection object without unsafe prototype keys.
 */
export function safeAssign<T extends object, S extends object>(
  target: T,
  source?: S | null,
): T & S {
  if (!source || typeof source !== 'object') {
    return { ...target } as T & S;
  }
  const result = { ...target } as T & S;
  for (const key of Object.keys(source)) {
    if (!isUnsafeKey(key)) {
      Reflect.set(result, key, Reflect.get(source, key));
    }
  }
  return result;
}

/**
 * Creates a shallow copy of a record containing only the specified keys.
 * Protects against prototype pollution by skipping unsafe keys.
 *
 * @template T - Value type of the record.
 * @template K - Key type of the record.
 * @param record - Source record.
 * @param keysToPick - Set or array of keys to include.
 * @returns A new record containing only the picked keys.
 */
export function pickRecordKeys<T, K extends string = string>(
  record: Partial<Record<K, T>>,
  keysToPick: ReadonlySet<K> | readonly K[],
): Partial<Record<K, T>> {
  if (!record) return {};
  const filterSet: ReadonlySet<string> =
    keysToPick instanceof Set ? keysToPick : new Set(keysToPick);
  const result: Partial<Record<K, T>> = {};
  for (const key of filterSet) {
    if (Object.hasOwn(record, key) && !isUnsafeKey(key)) {
      const val = record[key as K];
      if (val !== undefined) {
        result[key as K] = val;
      }
    }
  }
  return result;
}

/**
 * Checks whether a record contains zero own enumerable properties.
 * Executes in O(1) without heap allocation (unlike Object.keys(record).length === 0).
 *
 * @param record - Source record to inspect.
 * @returns True if nullish or having no own enumerable properties.
 */
export function isEmptyRecord(record?: object | null): boolean {
  if (!record) return true;
  for (const key in record) {
    if (Object.hasOwn(record, key)) return false;
  }
  return true;
}

/**
 * Transforms the values of a record using a mapping function.
 * Protects against prototype pollution by skipping unsafe keys.
 *
 * @template K - Key type.
 * @template V - Input value type.
 * @template R - Output value type.
 * @param record - Source record.
 * @param fn - Value transformer function.
 * @returns A new record with transformed values.
 */
export function mapRecordValues<K extends string | number, V, R>(
  record: Partial<Record<K, V>>,
  fn: (value: V, key: K) => R,
): Partial<Record<K, R>> {
  if (!record || isEmptyRecord(record)) return {};
  const result: Partial<Record<K, R>> = {};
  for (const key in record) {
    if (Object.hasOwn(record, key) && !isUnsafeKey(String(key))) {
      const val = record[key as K];
      if (val !== undefined) {
        result[key as K] = fn(val, key as unknown as K);
      }
    }
  }
  return result;
}

/**
 * Filters a record based on a key-value predicate evaluation.
 * Protects against prototype pollution by skipping unsafe keys.
 *
 * @template K - Key type.
 * @template V - Value type.
 * @param record - Source record.
 * @param predicate - Entry filter function.
 * @returns A new record containing only entries that satisfied the predicate.
 */
export function filterRecord<K extends string | number, V>(
  record: Record<K, V>,
  predicate: (value: V, key: K) => boolean,
): Record<K, V>;
export function filterRecord<K extends string | number, V>(
  record: Partial<Record<K, V>>,
  predicate: (value: V, key: K) => boolean,
): Partial<Record<K, V>>;
export function filterRecord<K extends string | number, V>(
  record: Partial<Record<K, V>>,
  predicate: (value: V, key: K) => boolean,
): Partial<Record<K, V>> {
  if (!record || isEmptyRecord(record)) return {};
  const result: Partial<Record<K, V>> = {};
  for (const key in record) {
    if (Object.hasOwn(record, key) && !isUnsafeKey(String(key))) {
      const val = record[key as K];
      if (val !== undefined && predicate(val, key as unknown as K)) {
        result[key as K] = val;
      }
    }
  }
  return result;
}

/**
 * Removes null and undefined values from a record, returning a clean partial record.
 * Protects against prototype pollution by skipping unsafe keys.
 *
 * @template K - Key type.
 * @template V - Value type.
 * @param record - Source record.
 * @returns A new record containing only defined, non-null values.
 */
export function compactRecord<K extends string | number, V>(
  record?: Partial<Record<K, V | null | undefined>> | null,
): Partial<Record<K, V>> {
  if (!record || isEmptyRecord(record)) return {};
  const result: Partial<Record<K, V>> = {};
  for (const key in record) {
    if (Object.hasOwn(record, key) && !isUnsafeKey(String(key))) {
      const val = record[key as K];
      if (val !== undefined && val !== null) {
        result[key as K] = val;
      }
    }
  }
  return result;
}

/**
 * Inverts keys and values of a record ({ a: 'x' } -> { x: 'a' }).
 * Protects against prototype pollution by skipping unsafe keys and values.
 *
 * @template K - Source key type.
 * @template V - Source value type.
 * @param record - Source record with unique string or number values.
 * @returns A new inverted record.
 */
export function invertRecord<K extends string, V extends string | number>(
  record?: Record<K, V> | null,
): Record<V, K> {
  const result: Record<string, K> = {};
  if (!record || isEmptyRecord(record)) return result as Record<V, K>;
  for (const key in record) {
    if (Object.hasOwn(record, key) && !isUnsafeKey(key)) {
      const val = record[key];
      if (val !== undefined && val !== null && !isUnsafeKey(String(val))) {
        Reflect.set(result, String(val), key);
      }
    }
  }
  return result;
}

/**
 * Recursively freezes an object and its nested properties, preventing runtime mutations.
 *
 * @template T - Object type.
 * @param obj - Target object to freeze deeply.
 * @returns Deeply frozen object.
 */
export function freezeDeep<T>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (!isUnsafeKey(key)) {
      const val = Reflect.get(obj, key);
      if (typeof val === 'object' && val !== null && !Object.isFrozen(val)) {
        freezeDeep(val);
      }
    }
  }
  return Object.freeze(obj);
}


