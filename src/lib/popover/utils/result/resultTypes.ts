/**
 * Result Types and Core Constructors.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/result/resultTypes
 */

import type { PopoverError } from '../errors';
import { isObjectRecord } from '../guards/objectGuards';

export interface OkResult<T> {
  readonly success: true;
  readonly data: T;
}

export interface ErrResult<E> {
  readonly success: false;
  readonly error: E;
}

export type Result<T, E = PopoverError> = OkResult<T> | ErrResult<E>;

export type { InferOk, InferErr } from '../../types/utilityTypes';

/**
 * Creates a frozen OkResult representing successful computation with data.
 *
 * @param data - The success payload.
 * @returns An immutable OkResult wrapper.
 */
export function Ok<T>(data: T): OkResult<T> {
  return Object.freeze({ success: true, data });
}

/**
 * Creates a frozen ErrResult representing a failed computation with a typed error.
 *
 * @param error - The failure description or domain error object.
 * @returns An immutable ErrResult wrapper.
 */
export function Err<E>(error: E): ErrResult<E> {
  return Object.freeze({ success: false, error });
}

/** Alias for Ok constructor. */
export const ok = Ok;
/** Alias for Err constructor. */
export const err = Err;

/**
 * Type guard asserting that a Result is an OkResult.
 *
 * @param result - Result instance to inspect.
 * @returns True if the result represents success.
 */
export function isOk<T, E>(result: Result<T, E>): result is OkResult<T> {
  return result.success;
}

/**
 * Type guard asserting that a Result is an ErrResult.
 *
 * @param result - Result instance to inspect.
 * @returns True if the result represents failure.
 */
export function isErr<T, E>(result: Result<T, E>): result is ErrResult<E> {
  return !result.success;
}

/** Validates whether an unknown value conforms to a Result structure. */
export function isResult<T = unknown, E = unknown>(val: unknown): val is Result<T, E> {
  return isObjectRecord(val) && typeof val.success === 'boolean';
}

/** Non-throwing type guard checking if an unknown value is an OkResult. */
export function isOkResult<T = unknown>(val: unknown): val is OkResult<T> {
  return isResult(val) && val.success === true && 'data' in val;
}

/** Non-throwing type guard checking if an unknown value is an ErrResult. */
export function isErrResult<E = unknown>(val: unknown): val is ErrResult<E> {
  return isResult(val) && val.success === false && 'error' in val;
}
