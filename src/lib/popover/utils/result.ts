/**
 * Monadic Result<T, E> Pattern for Explicit Railway-Oriented Error Handling.
 * Eliminates unhandled promise rejections and silent try/catch blocks.
 *
 * @module result
 */

import { PopoverError, PopoverErrorCode } from './errors';

/** Successful Result variant carrying payload data. */
export interface OkResult<T> {
  readonly success: true;
  readonly data: T;
}

/** Error Result variant carrying error object. */
export interface ErrResult<E> {
  readonly success: false;
  readonly error: E;
}

/** Monadic Result discriminated union type. */
export type Result<T, E = PopoverError> = OkResult<T> | ErrResult<E>;

/** Constructor for successful Ok Result. */
export function Ok<T>(data: T): OkResult<T> {
  return Object.freeze({ success: true, data });
}

/** Constructor for failure Err Result. */
export function Err<E>(error: E): ErrResult<E> {
  return Object.freeze({ success: false, error });
}

/** Type guard for Ok Result. */
export function isOk<T, E>(result: Result<T, E>): result is OkResult<T> {
  return result.success;
}

/** Type guard for Err Result. */
export function isErr<T, E>(result: Result<T, E>): result is ErrResult<E> {
  return !result.success;
}

/** Maps successful data payload preserving error. */
export function mapResult<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> {
  if (result.success) {
    return Ok(fn(result.data));
  }
  return result;
}

/** FlatMaps successful data payload to another Result. */
export function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>,
): Result<U, E> {
  if (result.success) {
    return fn(result.data);
  }
  return result;
}

/** Maps error payload preserving success data. */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  if (!result.success) {
    return Err(fn(result.error));
  }
  return result;
}

/** Unwraps result data or returns fallback value if error. */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.success ? result.data : fallback;
}

/** Unwraps result data or throws error if result is Err. */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error instanceof Error ? result.error : new Error(String(result.error));
}

/** Pattern matches against Ok and Err result branches. */
export function matchResult<T, E, R>(
  result: Result<T, E>,
  patterns: { ok: (data: T) => R; err: (error: E) => R },
): R {
  return result.success ? patterns.ok(result.data) : patterns.err(result.error);
}

/** Wraps a throwing function execution into a safe Result. */
export function wrapResult<T>(fn: () => T): Result<T, PopoverError> {
  try {
    return Ok(fn());
  } catch (err) {
    if (err instanceof PopoverError) {
      return Err(err);
    }
    return Err(
      new PopoverError(
        PopoverErrorCode.INVALID_TRANSITION,
        err instanceof Error ? err.message : String(err),
        undefined,
        err,
      ),
    );
  }
}

/** Wraps an async throwing promise into a safe Result. */
export async function wrapAsyncResult<T>(promise: Promise<T>): Promise<Result<T, PopoverError>> {
  try {
    const data = await promise;
    return Ok(data);
  } catch (err) {
    if (err instanceof PopoverError) {
      return Err(err);
    }
    return Err(
      new PopoverError(
        PopoverErrorCode.RESOLVER_TIMEOUT,
        err instanceof Error ? err.message : String(err),
        undefined,
        err,
      ),
    );
  }
}
