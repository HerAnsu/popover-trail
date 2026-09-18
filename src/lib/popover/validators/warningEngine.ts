import { PopoverWarningCode } from './warningCodes';

export { PopoverWarningCode };

/**
 * Structured details for emitting developer guardrail warnings.
 */
export interface DevWarningDetails {
  /** Unique error code identifier. */
  code: PopoverWarningCode;
  /** Detailed error message describing what went wrong. */
  message: string;
}

declare const process: { env?: Record<string, string | undefined> } | undefined;

const IS_DEV = typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production';

/**
 * Returns true if the current environment is development mode (`NODE_ENV !== 'production'`).
 *
 * @returns Boolean flag indicating dev environment.
 *
 * @example
 * ```typescript
 * if (isDevEnv()) {
 *   console.log('Running in development mode');
 * }
 * ```
 */
export function isDevEnv(): boolean {
  return IS_DEV;
}

/** Single Source of Truth for logging warnings to console in dev mode */
function emitDevWarning(code: string, message: string): void {
  console.warn(`[popover-trail warning ${code}]: ${message}`);
}

/**
 * Development guardrail warning logger.
 * Emits a console warning if `condition` is true and running in development mode.
 *
 * @param condition - Boolean expression to evaluate; emits warning if true.
 * @param message - Diagnostic message text.
 *
 * @example
 * ```typescript
 * warnDev(!isValid, 'Invalid state detected during execution');
 * ```
 */
export function warnDev(condition: boolean, message: string): void {
  if (isDevEnv() && condition) {
    console.warn(`[popover-trail dev warning]: ${message}`);
  }
}

/**
 * Type guard verifying if an unknown object is valid DevWarningDetails.
 *
 * @param val - Candidate value to test.
 * @returns True if `val` conforms to `DevWarningDetails`.
 *
 * @example
 * ```typescript
 * if (isDevWarningDetails(err)) {
 *   console.log(err.code, err.message);
 * }
 * ```
 */
export function isDevWarningDetails(val: unknown): val is DevWarningDetails {
  return (
    typeof val === 'object' &&
    val !== null &&
    'code' in val &&
    typeof val.code === 'string' &&
    'message' in val &&
    typeof val.message === 'string'
  );
}

/**
 * Structured error logger with code and detailed message.
 * Emits a standardized `[popover-trail warning CODE]: message` warning in dev mode when `condition` is true.
 *
 * @param condition - Boolean expression to evaluate; emits warning if true.
 * @param details - Structured warning payload containing `code` and `message`.
 *
 * @example
 * ```typescript
 * warnDevDetails(width <= 0, {
 *   code: PopoverWarningCode.INVALID_QUADTREE_BOUNDS,
 *   message: 'Width must be positive',
 * });
 * ```
 */
export function warnDevDetails(condition: boolean, details: DevWarningDetails): void {
  if (isDevEnv() && condition && isDevWarningDetails(details)) {
    emitDevWarning(details.code, details.message);
  }
}
