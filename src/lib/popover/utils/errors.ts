/**
 * Actionable Error class for PopoverTrail operations.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/errors
 */

import { PopoverErrorCode, formatPopoverErrorMessage } from './errorFormatting';

export { PopoverErrorCode, formatPopoverErrorMessage };

export class PopoverError<TCode extends PopoverErrorCode = PopoverErrorCode> extends Error {
  public override readonly name = 'PopoverError';
  public readonly code: TCode;
  public override readonly cause?: unknown;
  public readonly remediationHint?: string;

  constructor(code: TCode, message: string, remediationHint?: string, cause?: unknown) {
    super(formatPopoverErrorMessage(code, message, remediationHint));
    this.code = code;
    this.remediationHint = remediationHint;
    this.cause = cause;

    if ('captureStackTrace' in Error && typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, PopoverError);
    }
  }

  public static isPopoverError<C extends PopoverErrorCode>(
    error: unknown,
    code: C,
  ): error is PopoverError<C>;
  public static isPopoverError(error: unknown): error is PopoverError;
  public static isPopoverError(error: unknown, code?: PopoverErrorCode): error is PopoverError {
    if (!(error instanceof PopoverError)) return false;
    return code === undefined || error.code === code;
  }
}

export function createPopoverError<TCode extends PopoverErrorCode = PopoverErrorCode>(
  code: TCode,
  message: string,
  remediationHint?: string,
  cause?: unknown,
): PopoverError<TCode> {
  return new PopoverError(code, message, remediationHint, cause);
}

export function isPopoverError<C extends PopoverErrorCode>(
  error: unknown,
  code: C,
): error is PopoverError<C>;
export function isPopoverError(error: unknown): error is PopoverError;
export function isPopoverError(error: unknown, code?: PopoverErrorCode): error is PopoverError {
  return code !== undefined
    ? PopoverError.isPopoverError(error, code)
    : PopoverError.isPopoverError(error);
}
