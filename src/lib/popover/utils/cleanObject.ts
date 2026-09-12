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
export function safeAssign<T extends Record<string, unknown>, S extends Record<string, unknown>>(
  target: T,
  source: S,
): T & S {
  const result: Record<string, unknown> = { ...target };
  for (const key in source) {
    if (Object.hasOwn(source, key) && !isUnsafeKey(key)) {
      result[key] = source[key];
    }
  }
  return result as T & S;
}
