/**
 * String and Primitive Type Guards.
 *
 * @module utils/guards/stringGuards
 */

import { and } from '../functional';
import { isArray } from './arrayGuards';

/** Checks whether a value is a trimmed, non-empty string. */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Checks whether a value is a callable function. */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

const checkRecordCandidate = and(
  (val: unknown) => typeof val === 'object',
  (val: unknown) => val !== null,
  (val: unknown) => !isArray(val),
);

/** Checks whether a value is a non-null, non-array object record. */
export function isRecordObject(value: unknown): value is Record<string, unknown> {
  return checkRecordCandidate(value);
}
