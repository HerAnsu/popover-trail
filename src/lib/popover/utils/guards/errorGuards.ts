/**
 * Error Type Guards and Normalization Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/errorGuards
 */

import { isPlainObject, isObjectRecord } from './objectGuards';

/**
 * Type guard checking if an unknown value is an instance of Error.
 *
 * @param val - Candidate value to evaluate.
 * @returns True if `val` is an `Error` instance.
 *
 * @example
 * ```typescript
 * if (isError(caught)) {
 *   console.error(caught.stack);
 * }
 * ```
 */
export function isError(val: unknown): val is Error {
  return val instanceof Error;
}

/**
 * Cross-realm duck-type guard checking if an object has error-like structure (name and message).
 *
 * @param val - Candidate value to evaluate.
 * @returns True if `val` is an Error or error-like record.
 *
 * @example
 * ```typescript
 * if (isErrorLike(err)) {
 *   console.log(err.message);
 * }
 * ```
 */
export function isErrorLike(val: unknown): val is { name: string; message: string } {
  return (
    isError(val) ||
    (isPlainObject(val) && typeof val.name === 'string' && typeof val.message === 'string')
  );
}

/**
 * Checks if an error represents an AbortError from an AbortController or fetch cancellation.
 *
 * @param err - Candidate error to inspect.
 * @returns True if `err` represents an aborted operation.
 *
 * @example
 * ```typescript
 * if (isAbortError(err)) {
 *   // Ignore cancellation
 * }
 * ```
 */
export function isAbortError(err: unknown): boolean {
  if (!err) return false;
  if (isErrorLike(err) && err.name === 'AbortError') return true;
  return isObjectRecord(err) && err.code === 20;
}

/**
 * Normalizes any unknown thrown value or error candidate into a standard Error object.
 *
 * @param err - Thrown candidate or error object.
 * @returns Standardized `Error` instance.
 *
 * @example
 * ```typescript
 * const error = toError(thrownVal);
 * ```
 */
export function toError(err: unknown): Error {
  return isError(err) ? err : new Error(String(err));
}

/**
 * Extracts a descriptive error message string from any unknown thrown entity.
 *
 * @param err - Thrown candidate or error object.
 * @returns Human-readable error message.
 *
 * @example
 * ```typescript
 * const msg = toErrorMessage(err);
 * ```
 */
export function toErrorMessage(err: unknown): string {
  return isErrorLike(err) ? err.message : String(err);
}

export { isPopoverError } from '../errors';
