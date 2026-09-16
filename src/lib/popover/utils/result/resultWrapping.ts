/**
 * Exception Wrapping Helpers for Result Monad.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/result/resultWrapping
 */

import { Ok, Err, type Result } from './resultTypes';
import { PopoverError, PopoverErrorCode } from '../errors';
import { toErrorMessage } from '../guards/errorGuards';

/**
 * Safely executes a synchronous function, catching any exceptions and returning a `Result<T, PopoverError>`.
 *
 * @remarks
 * If the caught exception is already an instance of `PopoverError`, it is returned directly.
 * Otherwise, wraps the unknown exception into a `PopoverError` with `INVALID_TRANSITION` error code.
 *
 * @example
 * ```ts
 * const result = wrapResult(() => computeLayout(config));
 * if (isOk(result)) {
 *   render(result.data);
 * }
 * ```
 *
 * @param fn - Synchronous function to execute safely.
 * @returns Ok with the return value, or Err with PopoverError.
 */
export function wrapResult<T>(fn: () => T): Result<T, PopoverError> {
  try {
    return Ok(fn());
  } catch (err) {
    if (err instanceof PopoverError) return Err(err);
    return Err(
      new PopoverError(PopoverErrorCode.INVALID_TRANSITION, toErrorMessage(err), undefined, err),
    );
  }
}

/**
 * Safely awaits an asynchronous Promise, catching any rejections and returning a `Promise<Result<T, PopoverError>>`.
 *
 * @remarks
 * If the rejection reason is already an instance of `PopoverError`, it is returned directly.
 * Otherwise, wraps the exception into a `PopoverError` with `RESOLVER_TIMEOUT` error code.
 *
 * @example
 * ```ts
 * const result = await wrapAsyncResult(fetchCardData(id));
 * ```
 *
 * @param promise - Promise to await safely.
 * @returns Promise resolving to Ok or Err with PopoverError.
 */
export async function wrapAsyncResult<T>(promise: Promise<T>): Promise<Result<T, PopoverError>> {
  try {
    const data = await promise;
    return Ok(data);
  } catch (err) {
    if (err instanceof PopoverError) return Err(err);
    return Err(
      new PopoverError(PopoverErrorCode.RESOLVER_TIMEOUT, toErrorMessage(err), undefined, err),
    );
  }
}
