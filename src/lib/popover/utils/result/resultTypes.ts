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
 * @template T - Data payload type.
 * @param data - The success payload.
 * @returns An immutable OkResult wrapper.
 *
 * @example
 * ```typescript
 * const res = Ok(42);
 * if (res.success) {
 *   console.log(res.data); // 42
 * }
 * ```
 */
export function Ok<T>(data: T): OkResult<T> {
  return Object.freeze({ success: true, data });
}

/**
 * Creates a frozen ErrResult representing a failed computation with a typed error.
 *
 * @template E - Error payload type.
 * @param error - The failure description or domain error object.
 * @returns An immutable ErrResult wrapper.
 *
 * @example
 * ```typescript
 * const res = Err(new Error('Failed to resolve'));
 * if (!res.success) {
 *   console.error(res.error);
 * }
 * ```
 */
export function Err<E>(error: E): ErrResult<E> {
  return Object.freeze({ success: false, error });
}

/**
 * Type guard asserting that a Result is an OkResult.
 *
 * @template T - Data payload type.
 * @template E - Error payload type.
 * @param result - Result instance to inspect.
 * @returns True if the result represents success.
 *
 * @example
 * ```typescript
 * if (isOk(res)) {
 *   console.log(res.data);
 * }
 * ```
 */
export function isOk<T, E>(result: Result<T, E>): result is OkResult<T> {
  return result.success;
}

/**
 * Type guard asserting that a Result is an ErrResult.
 *
 * @template T - Data payload type.
 * @template E - Error payload type.
 * @param result - Result instance to inspect.
 * @returns True if the result represents failure.
 *
 * @example
 * ```typescript
 * if (isErr(res)) {
 *   console.error(res.error);
 * }
 * ```
 */
export function isErr<T, E>(result: Result<T, E>): result is ErrResult<E> {
  return !result.success;
}

/**
 * Validates whether an unknown value conforms to a Result structure.
 *
 * @template T - Expected Ok data type.
 * @template E - Expected Err error type.
 * @param val - Candidate value to evaluate.
 * @returns True if `val` is a non-null object with boolean `success` property.
 *
 * @example
 * ```typescript
 * if (isResult(val)) {
 *   console.log(val.success);
 * }
 * ```
 */
export function isResult<T = unknown, E = unknown>(val: unknown): val is Result<T, E> {
  return isObjectRecord(val) && typeof val.success === 'boolean';
}

/**
 * Non-throwing type guard checking if an unknown value is an OkResult.
 *
 * @template T - Expected Ok data type.
 * @param val - Candidate value to evaluate.
 * @returns True if `val` is an OkResult.
 *
 * @example
 * ```typescript
 * if (isOkResult(val)) {
 *   console.log(val.data);
 * }
 * ```
 */
export function isOkResult<T = unknown>(val: unknown): val is OkResult<T> {
  return isResult(val) && val.success === true && 'data' in val;
}

/**
 * Non-throwing type guard checking if an unknown value is an ErrResult.
 *
 * @template E - Expected Err error type.
 * @param val - Candidate value to evaluate.
 * @returns True if `val` is an ErrResult.
 *
 * @example
 * ```typescript
 * if (isErrResult(val)) {
 *   console.error(val.error);
 * }
 * ```
 */
export function isErrResult<E = unknown>(val: unknown): val is ErrResult<E> {
  return isResult(val) && val.success === false && 'error' in val;
}
