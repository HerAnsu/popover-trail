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

/**
 * Custom Actionable Error class for PopoverTrail with error code, remediation hints, and optional cause.
 */
export class PopoverError extends Error {
  public override readonly name = 'PopoverError';
  public readonly code: PopoverErrorCode;
  public override readonly cause?: unknown;
  public readonly remediationHint?: string;

  constructor(code: PopoverErrorCode, message: string, remediationHint?: string, cause?: unknown) {
    const formattedMessage = remediationHint
      ? `[popover-trail:${code}] ${message}\n  💡 Remediation Hint: ${remediationHint}`
      : `[popover-trail:${code}] ${message}`;
    super(formattedMessage);
    this.code = code;
    this.remediationHint = remediationHint;
    this.cause = cause;

    // Maintain standard stack trace in V8 environments
    const errorConstructor = Error as unknown as {
      captureStackTrace?: (targetObject: object, constructorOpt?: Function) => void;
    };
    if (typeof errorConstructor.captureStackTrace === 'function') {
      errorConstructor.captureStackTrace(this, PopoverError);
    }
  }

  /** Checks if a given value is an instance of PopoverError with a specific code. */
  public static isPopoverError(error: unknown, code?: PopoverErrorCode): error is PopoverError {
    if (!(error instanceof PopoverError)) {
      return false;
    }
    return code === undefined || error.code === code;
  }
}

/**
 * Factory helper function to create standardized PopoverError instances with diagnostic hints.
 */
export function createPopoverError(
  code: PopoverErrorCode,
  message: string,
  remediationHint?: string,
  cause?: unknown,
): PopoverError {
  return new PopoverError(code, message, remediationHint, cause);
}
