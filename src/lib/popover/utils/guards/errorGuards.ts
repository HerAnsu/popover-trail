/**
 * Error Type Guards and Normalization Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/errorGuards
 */

import { isPlainObject, isObjectRecord } from './objectGuards';

/** Type guard checking if an unknown value is an instance of Error. */
export function isError(val: unknown): val is Error {
  return val instanceof Error;
}

/** Cross-realm duck-type guard checking if an object has error-like structure (name and message). */
export function isErrorLike(val: unknown): val is { name: string; message: string } {
  return (
    isError(val) ||
    (isPlainObject(val) && typeof val.name === 'string' && typeof val.message === 'string')
  );
}

/** Checks if an error represents an AbortError from an AbortController or fetch cancellation. */
export function isAbortError(err: unknown): boolean {
  if (!err) return false;
  if (isErrorLike(err) && err.name === 'AbortError') return true;
  return isObjectRecord(err) && err.code === 20;
}

/** Normalizes any unknown thrown value or error candidate into a standard Error object. */
export function toError(err: unknown): Error {
  return isError(err) ? err : new Error(String(err));
}

/** Extracts a descriptive error message string from any unknown thrown entity. */
export function toErrorMessage(err: unknown): string {
  return isErrorLike(err) ? err.message : String(err);
}

export { isPopoverError } from '../errors';
