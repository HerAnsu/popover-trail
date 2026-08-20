/**
 * Strongly typed error codes and Actionable Error class for PopoverTrail operations.
 *
 * @module errors
 */

/**
 * Strongly typed error codes for PopoverTrail operations.
 */
export const PopoverErrorCode = {
  /** Data resolver promise timed out or was aborted. */
  RESOLVER_TIMEOUT: 'ERR_RESOLVER_TIMEOUT',
  /** Worker RPC task rejected or failed to instantiate. */
  WORKER_CRASHED: 'ERR_WORKER_CRASHED',
  /** State persistence read or write failed. */
  PERSIST_FAILED: 'ERR_PERSIST_FAILED',
  /** Invalid transition dispatched to FSM. */
  INVALID_TRANSITION: 'ERR_INVALID_TRANSITION',
  /** Circular dependency detected in cascade path. */
  CIRCULAR_CASCADE: 'ERR_CIRCULAR_CASCADE',
  /** Element unmounted while operation in progress. */
  UNMOUNTED: 'ERR_UNMOUNTED',
} as const;

export type PopoverErrorCode = (typeof PopoverErrorCode)[keyof typeof PopoverErrorCode];

export function formatPopoverErrorMessage(
  code: PopoverErrorCode,
  message: string,
  remediationHint?: string,
): string {
  return remediationHint
    ? `[popover-trail:${code}] ${message}\n  💡 Remediation Hint: ${remediationHint}`
    : `[popover-trail:${code}] ${message}`;
}

/**
 * Custom Actionable Error class for PopoverTrail.
 * Includes error codes, remediation guidance hints, and optional underlying cause chaining.
 *
 * @template TCode - Standardized error code identifier.
 * @remarks
 * Formats diagnostic messages with helpful remediation hints so developers immediately know how to fix issues.
 *
 * @example
 * ```typescript
 * throw new PopoverError(
 *   PopoverErrorCode.CIRCULAR_CASCADE,
 *   'Detected circular relationship when opening "userCard".',
 *   'Ensure parent and child cards do not reference each other in an infinite cycle.'
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

    // Maintain standard stack trace in V8 environments
    if ('captureStackTrace' in Error && typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, PopoverError);
    }
  }

  /** Checks if a given value is an instance of PopoverError, optionally narrowing to a specific error code. */
  public static isPopoverError<C extends PopoverErrorCode>(
    error: unknown,
    code: C,
  ): error is PopoverError<C>;
  public static isPopoverError(error: unknown): error is PopoverError;
  public static isPopoverError(error: unknown, code?: PopoverErrorCode): error is PopoverError {
    if (!(error instanceof PopoverError)) {
      return false;
    }
    return code === undefined || error.code === code;
  }
}

/**
 * Factory helper function to create standardized PopoverError instances with diagnostic hints.
 *
 * @template TCode - Standardized error code identifier.
 * @param code - Standardized error code identifier.
 * @param message - Descriptive failure message.
 * @param remediationHint - Optional advice on resolving the problem.
 * @param cause - Optional root cause error object.
 * @returns PopoverError instance ready to throw or wrap.
 */
export function createPopoverError<TCode extends PopoverErrorCode = PopoverErrorCode>(
  code: TCode,
  message: string,
  remediationHint?: string,
  cause?: unknown,
): PopoverError<TCode> {
  return new PopoverError(code, message, remediationHint, cause);
}
