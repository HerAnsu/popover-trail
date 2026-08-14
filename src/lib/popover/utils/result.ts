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

/**
 * Constructor creating a successful `Ok` Result variant.
 *
 * @example
 * ```typescript
 * const res = Ok({ id: 'user-1', name: 'Alice' });
 * if (isOk(res)) console.log(res.data.name);
 * ```
 *
 * @template T - Successful payload data type.
 * @param data - The successful data payload.
 */
export function Ok<T>(data: T): OkResult<T> {
  return Object.freeze({ success: true, data });
}

/**
 * Constructor creating a failure `Err` Result variant.
 *
 * @example
 * ```typescript
 * const res = Err(new Error('Network timeout'));
 * if (isErr(res)) console.error(res.error.message);
 * ```
 *
 * @template E - Error payload type.
 * @param error - The error object or reason.
 */
export function Err<E>(error: E): ErrResult<E> {
  return Object.freeze({ success: false, error });
}

/** Type predicate asserting that a Result is an Ok variant. */
export function isOk<T, E>(result: Result<T, E>): result is OkResult<T> {
  return result.success;
}

/** Type predicate asserting that a Result is an Err variant. */
export function isErr<T, E>(result: Result<T, E>): result is ErrResult<E> {
  return !result.success;
}

/**
 * Transforms the inner value of an Ok result using a mapping function.
 * Leaves Err results untouched.
 */
export function mapResult<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> {
  if (result.success) {
    return Ok(fn(result.data));
  }
  return result;
}

/**
 * Chains another Result-returning function onto an Ok result (monadic bind).
 * Leaves Err results untouched.
 */
export function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>,
): Result<U, E> {
  if (result.success) {
    return fn(result.data);
  }
  return result;
}

/**
 * Transforms the inner error of an Err result using a mapping function.
 * Leaves Ok results untouched.
 */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  if (!result.success) {
    return Err(fn(result.error));
  }
  return result;
}

/**
 * Extracts the inner value from an Ok result, or returns a fallback value if Err.
 */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.success ? result.data : fallback;
}

/**
 * Extracts the inner value from an Ok result, or throws if Err.
 *
 * @throws {Error} Throws the encapsulated error if result is Err.
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error instanceof Error ? result.error : new Error(String(result.error));
}

/**
 * Pattern-matches against both branches of a Result, executing the corresponding branch handler.
 *
 * @example
 * ```typescript
 * const message = matchResult(result, {
 *   ok: (user) => `Hello, ${user.name}`,
 *   err: (err) => `Failed: ${err.message}`,
 * });
 * ```
 */
export function matchResult<T, E, R>(
  result: Result<T, E>,
  patterns: { ok: (data: T) => R; err: (error: E) => R },
): R {
  return result.success ? patterns.ok(result.data) : patterns.err(result.error);
}

/**
 * Executes a potentially throwing synchronous function and wraps the result in an Ok or Err.
 */
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

/**
 * Awaits a potentially rejecting Promise and wraps the outcome into a safe Result.
 */
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
