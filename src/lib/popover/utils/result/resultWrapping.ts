/**
 * Exception Wrapping Helpers for Result Monad.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/result/resultWrapping
 */

import { Ok, Err, type Result } from './resultTypes';
import { PopoverError, PopoverErrorCode } from '../errors';
import { toErrorMessage } from '../guards/errorGuards';

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
