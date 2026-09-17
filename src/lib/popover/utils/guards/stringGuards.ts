/**
 * String and Primitive Type Guards.
 *
 * @module utils/guards/stringGuards
 */

import { and } from '../functional';
import { isArray } from './arrayGuards';

/**
 * Type guard verifying that a value is a non-empty string (excluding whitespace-only strings).
 *
 * @param value - Candidate value to evaluate.
 * @returns True if `value` is a trimmed, non-empty string.
 *
 * @example
 * ```typescript
 * isNonEmptyString('card-1'); // => true
 * isNonEmptyString('   ');    // => false
 * isNonEmptyString(null);     // => false
 * ```
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard verifying that a value is a callable function.
 *
 * @param value - Candidate value to evaluate.
 * @returns True if `value` is a callable function.
 *
 * @example
 * ```typescript
 * if (isFunction(callback)) {
 *   callback();
 * }
 * ```
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

const checkRecordCandidate = and(
  (val: unknown) => typeof val === 'object',
  (val: unknown) => val !== null,
  (val: unknown) => !isArray(val),
);

/**
 * Type guard verifying that a value is a non-null, non-array object record.
 *
 * @param value - Candidate value to evaluate.
 * @returns True if `value` is a record dictionary object.
 *
 * @example
 * ```typescript
 * isRecordObject({ id: 1 }); // => true
 * isRecordObject([1, 2]);    // => false
 * isRecordObject(null);      // => false
 * ```
 */
export function isRecordObject(value: unknown): value is Record<string, unknown> {
  return checkRecordCandidate(value);
}
