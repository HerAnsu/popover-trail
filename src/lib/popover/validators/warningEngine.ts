import { PopoverWarningCode } from './warningCodes';

export { PopoverWarningCode };

export interface DevWarningDetails {
  /** Unique error code identifier. */
  code: PopoverWarningCode;
  /** Detailed error message describing what went wrong. */
  message: string;
}

declare const process: { env?: Record<string, string | undefined> } | undefined;

const IS_DEV = typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production';

export function isDevEnv(): boolean {
  return IS_DEV;
}

/** Single Source of Truth for logging warnings to console in dev mode */
function emitDevWarning(code: string, message: string): void {
  console.warn(`[popover-trail warning ${code}]: ${message}`);
}

/**
 * Development guardrail warning logger.
 */
export function warnDev(condition: boolean, message: string): void {
  if (isDevEnv() && condition) {
    console.warn(`[popover-trail dev warning]: ${message}`);
  }
}

/**
 * Type guard verifying if an unknown object is valid DevWarningDetails.
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
 */
export function warnDevDetails(condition: boolean, details: DevWarningDetails): void {
  if (isDevEnv() && condition && isDevWarningDetails(details)) {
    emitDevWarning(details.code, details.message);
  }
}
