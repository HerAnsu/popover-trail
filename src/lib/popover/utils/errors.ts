/**
 * Actionable Error class for PopoverTrail operations.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/errors
 */

import { PopoverErrorCode, formatPopoverErrorMessage } from './errorFormatting';

export { PopoverErrorCode, formatPopoverErrorMessage };

/**
 * Actionable domain error class for `popover-trail` library operations.
 *
 * Encapsulates an error code, user message, optional remediation hint, and causal error.
 * Formats messages automatically into standardized diagnostic output.
 *
 * @template TCode - Specific PopoverErrorCode string union type.
 *
 * @example
 * ```typescript
 * throw new PopoverError(
 *   PopoverErrorCode.INVALID_TRANSITION,
 *   'Cannot open unmounted popover',
 *   'Verify provider is mounted in DOM before triggering actions.',
 * );
 * ```
 */
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

  /**
   * Type guard checking if an error is a PopoverError, optionally narrowing by specific code.
   *
   * @template C - Specific PopoverErrorCode.
   * @param error - Unknown error candidate.
   * @param code - Optional specific code to check.
   * @returns True if error is a PopoverError matching code.
   *
   * @example
   * ```typescript
   * if (PopoverError.isPopoverError(err, PopoverErrorCode.CIRCULAR_CASCADE)) {
   *   console.error('Circular popover reference detected!');
   * }
   * ```
   */
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

/**
 * Factory helper creating a new PopoverError instance.
 *
 * @template TCode - Specific error code type.
 * @param code - Standardized PopoverErrorCode.
 * @param message - Descriptive failure message.
 * @param remediationHint - Actionable suggestion for the developer.
 * @param cause - Optional root cause error.
 * @returns New PopoverError instance.
 *
 * @example
 * ```typescript
 * const err = createPopoverError(PopoverErrorCode.RESOLVER_TIMEOUT, 'Resolver took > 5000ms');
 * ```
 */
export function createPopoverError<TCode extends PopoverErrorCode = PopoverErrorCode>(
  code: TCode,
  message: string,
  remediationHint?: string,
  cause?: unknown,
): PopoverError<TCode> {
  return new PopoverError(code, message, remediationHint, cause);
}

/**
 * Type guard verifying if an unknown error object is a PopoverError.
 *
 * @template C - Specific PopoverErrorCode.
 * @param error - Error object to inspect.
 * @param code - Optional code to match.
 * @returns True if error conforms to PopoverError.
 *
 * @example
 * ```typescript
 * if (isPopoverError(err)) {
 *   console.log('Error code:', err.code);
 * }
 * ```
 */
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
